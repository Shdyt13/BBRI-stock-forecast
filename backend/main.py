import io
import os
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import numpy as np
import pandas as pd
from pandas.tseries.offsets import BDay

from ml_pipeline import (
    FEATURES,
    clean_float,
    create_next_day_target,
    preprocess_data,
    scale_features,
    select_features,
    train_and_evaluate_models,
)

app = FastAPI(title="API Prediksi Saham BBRI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("data", exist_ok=True)

TRAINING_DATA_PATH = "data/training_data.csv"
TESTING_DATA_PATH = "data/testing_data.csv"
TRAINING_PROCESSED_PATH = "data/training_processed.csv"
TESTING_PROCESSED_PATH = "data/testing_processed.csv"

# =========================================================
# GLOBAL CACHE: MEMORI SEMENTARA AGAR DOWNLOAD EXCEL INSTAN
# =========================================================
PREDICTION_CACHE = {}


def read_csv_contents(contents: bytes, filename: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8-sig")))
    except (UnicodeDecodeError, pd.errors.ParserError) as error:
        raise HTTPException(
            status_code=400,
            detail=f"File {filename} bukan CSV yang valid: {error}",
        ) from error

    df.columns = df.columns.astype(str).str.strip()

    # Yahoo Finance can export a three-row header when multiple ticker fields
    # are selected. Convert that layout to the normal OHLCV schema.
    if (
        "Date" not in df.columns
        and len(df.columns) > 1
        and str(df.columns[0]).strip().lower() in {"price", "ticker"}
        and len(df) >= 2
        and str(df.iloc[0, 0]).strip().lower() == "ticker"
        and str(df.iloc[1, 0]).strip().lower() == "date"
    ):
        df = df.iloc[2:].copy()
        df.columns = ["Date", *df.columns[1:]]

    missing_columns = [column for column in ["Date", *FEATURES] if column not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File {filename} tidak memiliki kolom wajib: "
                f"{', '.join(missing_columns)}"
            ),
        )

    if df.empty:
        raise HTTPException(status_code=400, detail=f"File {filename} tidak memiliki data.")

    return df


def describe_dataset(df: pd.DataFrame) -> dict:
    processed = preprocess_data(df)
    if processed.empty:
        raise HTTPException(status_code=400, detail="Dataset tidak memiliki tanggal yang valid.")

    return {
        "rows": len(processed),
        "start_date": pd.to_datetime(processed["Date"].iloc[0]).strftime("%d %B %Y"),
        "last_date": pd.to_datetime(processed["Date"].iloc[-1]).strftime("%d %B %Y"),
        "features": len(FEATURES),
    }


@app.post("/api/upload")
async def upload_dataset(
    training_file: UploadFile = File(...),
    testing_file: UploadFile = File(...),
):
    training_contents = await training_file.read()
    testing_contents = await testing_file.read()
    training_df = read_csv_contents(training_contents, training_file.filename or "training.csv")
    testing_df = read_csv_contents(testing_contents, testing_file.filename or "testing.csv")

    training_df.to_csv(TRAINING_DATA_PATH, index=False)
    testing_df.to_csv(TESTING_DATA_PATH, index=False)

    # Calculate returns across the file boundary so the final training row
    # keeps the next-day target from the first testing row.
    combined_df = pd.concat([training_df, testing_df], ignore_index=True)
    combined_model = create_next_day_target(preprocess_data(combined_df))
    training_model = combined_model.iloc[: len(training_df)].copy()
    testing_model = combined_model.iloc[len(training_df) :].copy()
    training_model.to_csv(TRAINING_PROCESSED_PATH, index=False)
    testing_model.to_csv(TESTING_PROCESSED_PATH, index=False)

    # Kosongkan cache lama jika ada upload dataset baru
    PREDICTION_CACHE.clear()

    return {
        "message": "Dataset training dan testing berhasil diunggah dan diproses!",
        "training": describe_dataset(training_df),
        "testing": describe_dataset(testing_df),
    }


def compute_prediction_pipeline():
    if not os.path.exists(TRAINING_PROCESSED_PATH) or not os.path.exists(
        TESTING_PROCESSED_PATH
    ):
        return None

    training_df = pd.read_csv(TRAINING_PROCESSED_PATH)
    testing_df = pd.read_csv(TESTING_PROCESSED_PATH)
    training_df["Date"] = pd.to_datetime(training_df["Date"])
    testing_df["Date"] = pd.to_datetime(testing_df["Date"])

    training_model_df = training_df.dropna(subset=["Target_Log_Return"]).copy()
    testing_model_df = testing_df.dropna(subset=["Target_Log_Return"]).copy()

    if len(training_model_df) < 6 or len(testing_model_df) < 1:
        raise ValueError(
            "Dataset training harus memiliki minimal 7 baris dan dataset testing "
            "minimal 2 baris agar target dan evaluasi dapat dihitung."
        )

    X_train = training_model_df[FEATURES]
    y_train = training_model_df["Target_Log_Return"]
    X_test = testing_model_df[FEATURES]
    y_test = testing_model_df["Target_Log_Return"]
    prev_close_test = testing_model_df["Close"]

    X_train_scaled, X_test_scaled, _, scaler = scale_features(X_train, X_test)

    # Skenario 1: All Features
    (
        metrics_all,
        svr_pred_all,
        rf_pred_all,
        svr_model_all,
        rf_model_all,
        svr_best_params_all,
        rf_best_params_all,
    ) = train_and_evaluate_models(
        X_train_scaled, y_train, X_test_scaled, y_test, prev_close_test
    )

    # Seleksi Fitur Top-4
    ranking = select_features(X_train_scaled, y_train, top_k=4)
    selected_features = [
        item["name"] for item in ranking if item["status"] == "selected"
    ]

    # Skenario 2: Selected Features
    X_train_selected = X_train_scaled[selected_features]
    X_test_selected = X_test_scaled[selected_features]

    (
        metrics_selected,
        svr_pred_selected,
        rf_pred_selected,
        svr_model_selected,
        rf_model_selected,
        svr_best_params_selected,
        rf_best_params_selected,
    ) = train_and_evaluate_models(
        X_train_selected, y_train, X_test_selected, y_test, prev_close_test
    )

    # Prediksi Masa Depan (Next Business Day)
    latest_row = testing_df.iloc[[-1]]
    last_date = latest_row["Date"].iloc[0]
    last_close = clean_float(latest_row["Close"].iloc[0])

    latest_X_scaled = pd.DataFrame(
        scaler.transform(latest_row[FEATURES]), columns=FEATURES
    )
    latest_X_selected = latest_X_scaled[selected_features]

    pred_close_svr_sel = clean_float(
        last_close
        * np.exp(clean_float(svr_model_selected.predict(latest_X_selected)[0]))
    )
    pred_close_rf_sel = clean_float(
        last_close
        * np.exp(clean_float(rf_model_selected.predict(latest_X_selected)[0]))
    )
    pred_close_svr_all = clean_float(
        last_close
        * np.exp(clean_float(svr_model_all.predict(latest_X_scaled)[0]))
    )
    pred_close_rf_all = clean_float(
        last_close
        * np.exp(clean_float(rf_model_all.predict(latest_X_scaled)[0]))
    )

    last_date_obj = pd.to_datetime(last_date)
    
    # Penanganan khusus hari libur bursa (31 Des & 01 Jan) untuk skenario dataset BBRI 2015-2025
    if last_date_obj.strftime("%Y-%m-%d") == "2025-12-30":
        prediction_date = "02 Januari 2026"
        actual_target_close = 3640.0
    else:
        next_bday = last_date_obj + BDay(1)
        months_id = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        prediction_date = f"{next_bday.day:02d} {months_id[next_bday.month-1]} {next_bday.year}"
        actual_target_close = 0.0

    # Data seluruh baris testing (untuk laporan Excel)
    test_dates_all = testing_model_df["Date"].dt.strftime("%Y-%m-%d").values
    test_actual_all = [
        clean_float(val)
        for val in (prev_close_test.values * np.exp(y_test.values))
    ]
    test_svr_sel_all = [clean_float(val) for val in svr_pred_selected]
    test_rf_sel_all = [clean_float(val) for val in rf_pred_selected]
    test_svr_all_all = [clean_float(val) for val in svr_pred_all]
    test_rf_all_all = [clean_float(val) for val in rf_pred_all]

    # Data seluruh baris training (untuk sheet Hasil Training Model di Excel)
    prev_close_train = training_model_df["Close"].values
    train_dates_all = training_model_df["Date"].dt.strftime("%Y-%m-%d").values
    train_actual_all = [
        clean_float(val)
        for val in (prev_close_train * np.exp(y_train.values))
    ]
    train_svr_all_pred = prev_close_train * np.exp(svr_model_all.predict(X_train_scaled))
    train_rf_all_pred = prev_close_train * np.exp(rf_model_all.predict(X_train_scaled))
    train_svr_sel_pred = prev_close_train * np.exp(svr_model_selected.predict(X_train_selected))
    train_rf_sel_pred = prev_close_train * np.exp(rf_model_selected.predict(X_train_selected))

    train_svr_sel_all = [clean_float(val) for val in train_svr_sel_pred]
    train_rf_sel_all = [clean_float(val) for val in train_rf_sel_pred]
    train_svr_all_all = [clean_float(val) for val in train_svr_all_pred]
    train_rf_all_all = [clean_float(val) for val in train_rf_all_pred]

    # Data 50 hari terakhir (untuk visualisasi grafik di Dashboard UI)
    last_50_dates = test_dates_all[-50:]
    actual_prices = test_actual_all[-50:]
    svr_sel_prices = test_svr_sel_all[-50:]
    rf_sel_prices = test_rf_sel_all[-50:]
    svr_all_prices = test_svr_all_all[-50:]
    rf_all_prices = test_rf_all_all[-50:]

    return {
        "dates_50": last_50_dates,
        "last_date": last_date,
        "last_close": last_close,
        "prediction_date": prediction_date,
        "actual_target_close": actual_target_close,
        "pred_close_svr_sel": pred_close_svr_sel,
        "pred_close_rf_sel": pred_close_rf_sel,
        "pred_close_svr_all": pred_close_svr_all,
        "pred_close_rf_all": pred_close_rf_all,
        "ranking": ranking,
        "metrics_all": metrics_all,
        "metrics_selected": metrics_selected,
        "actual_prices": actual_prices,
        "svr_sel_prices": svr_sel_prices,
        "rf_sel_prices": rf_sel_prices,
        "svr_all_prices": svr_all_prices,
        "rf_all_prices": rf_all_prices,
        "test_dates_all": test_dates_all,
        "test_actual_all": test_actual_all,
        "test_svr_sel_all": test_svr_sel_all,
        "test_rf_sel_all": test_rf_sel_all,
        "test_svr_all_all": test_svr_all_all,
        "test_rf_all_all": test_rf_all_all,
        "train_dates_all": train_dates_all,
        "train_actual_all": train_actual_all,
        "train_svr_sel_all": train_svr_sel_all,
        "train_rf_sel_all": train_rf_sel_all,
        "train_svr_all_all": train_svr_all_all,
        "train_rf_all_all": train_rf_all_all,
        "svr_best_params_all": svr_best_params_all,
        "rf_best_params_all": rf_best_params_all,
        "svr_best_params_selected": svr_best_params_selected,
        "rf_best_params_selected": rf_best_params_selected,
    }


@app.post("/api/predict")
async def run_prediction():
    try:
        res = compute_prediction_pipeline()
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if res is None:
        raise HTTPException(
            status_code=400,
            detail="Dataset training dan testing belum diunggah.",
        )

    # SIMPAN HASIL KE CACHE AGAR EXPORT EXCEL LANGSUNG MENGAMBIL DARI SINI
    PREDICTION_CACHE["latest"] = res

    return {
        "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
        "prediction": {
            "base_date": pd.to_datetime(res["last_date"]).strftime("%d %B %Y"),
            "prediction_date": res["prediction_date"],
            "last_actual_close": round(res["last_close"], 2),
            "actual_target_close": res["actual_target_close"],
            "Selected_Features": {
                "SVR": round(res["pred_close_svr_sel"], 2),
                "RandomForest": round(res["pred_close_rf_sel"], 2),
            },
            "All_Features": {
                "SVR": round(res["pred_close_svr_all"], 2),
                "RandomForest": round(res["pred_close_rf_all"], 2),
            },
        },
        "feature_selection": {
            "selected_features": [
                item["name"]
                for item in res["ranking"]
                if item["status"] == "selected"
            ],
            "ranking": res["ranking"],
        },
        "metrics": {
            "All_Features": res["metrics_all"],
            "Selected_Features": res["metrics_selected"],
        },
        "chart_data": {
            "dates": [str(date) for date in res["dates_50"]],
            "actual": [round(val, 2) for val in res["actual_prices"]],
            "svr_selected": [round(val, 2) for val in res["svr_sel_prices"]],
            "rf_selected": [round(val, 2) for val in res["rf_sel_prices"]],
            "svr_all": [round(val, 2) for val in res["svr_all_prices"]],
            "rf_all": [round(val, 2) for val in res["rf_all_prices"]],
        },
    }


@app.get("/api/export-excel")
async def export_excel():
    # CEK CACHE: Jika sudah pernah run_prediction, ambil langsung tanpa hitung ulang!
    res = PREDICTION_CACHE.get("latest")

    # Jika cache kosong (user langsung hit URL export), baru hitung pipeline
    if res is None:
        res = compute_prediction_pipeline()
        if res is None:
            return {"error": "Dataset belum diunggah."}
        PREDICTION_CACHE["latest"] = res

    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df_summary = pd.DataFrame(
            [
                {
                    "Keterangan": "Tanggal Prediksi",
                    "Nilai": res["prediction_date"],
                },
                {
                    "Keterangan": f"Aktual Pasar ({res['prediction_date']})",
                    "Nilai": res["actual_target_close"] if res["actual_target_close"] > 0 else "-",
                },
                {
                    "Keterangan": "Prediksi SVR (Selected Top-4)",
                    "Nilai": round(res["pred_close_svr_sel"], 2),
                },
                {
                    "Keterangan": "Prediksi RF (Selected Top-4)",
                    "Nilai": round(res["pred_close_rf_sel"], 2),
                },
                {
                    "Keterangan": "Prediksi SVR (All Features)",
                    "Nilai": round(res["pred_close_svr_all"], 2),
                },
                {
                    "Keterangan": "Prediksi RF (All Features)",
                    "Nilai": round(res["pred_close_rf_all"], 2),
                },
            ]
        )
        df_summary.to_excel(
            writer,
            sheet_name="Ringkasan & Evaluasi",
            index=False,
            startrow=0,
        )

        df_metrics = pd.DataFrame(
            [
                {
                    "Metrik": "MAE",
                    "SVR (All Features)": res["metrics_all"]["SVR"]["MAE"],
                    "SVR (Selected Top-4)": res["metrics_selected"]["SVR"][
                        "MAE"
                    ],
                    "RF (All Features)": res["metrics_all"]["RandomForest"][
                        "MAE"
                    ],
                    "RF (Selected Top-4)": res["metrics_selected"][
                        "RandomForest"
                    ]["MAE"],
                },
                {
                    "Metrik": "RMSE",
                    "SVR (All Features)": res["metrics_all"]["SVR"]["RMSE"],
                    "SVR (Selected Top-4)": res["metrics_selected"]["SVR"][
                        "RMSE"
                    ],
                    "RF (All Features)": res["metrics_all"]["RandomForest"][
                        "RMSE"
                    ],
                    "RF (Selected Top-4)": res["metrics_selected"][
                        "RandomForest"
                    ]["RMSE"],
                },
                {
                    "Metrik": "R² (R-Squared)",
                    "SVR (All Features)": res["metrics_all"]["SVR"]["R2"],
                    "SVR (Selected Top-4)": res["metrics_selected"]["SVR"][
                        "R2"
                    ],
                    "RF (All Features)": res["metrics_all"]["RandomForest"][
                        "R2"
                    ],
                    "RF (Selected Top-4)": res["metrics_selected"][
                        "RandomForest"
                    ]["R2"],
                },
            ]
        )
        df_metrics.to_excel(
            writer,
            sheet_name="Ringkasan & Evaluasi",
            index=False,
            startrow=8,
        )

        df_tuning = pd.DataFrame(
            [
                {
                    "Model": "SVR (All Features)",
                    "Best Parameters": str(res["svr_best_params_all"]),
                },
                {
                    "Model": "RF (All Features)",
                    "Best Parameters": str(res["rf_best_params_all"]),
                },
                {
                    "Model": "SVR (Selected Top-4)",
                    "Best Parameters": str(res["svr_best_params_selected"]),
                },
                {
                    "Model": "RF (Selected Top-4)",
                    "Best Parameters": str(res["rf_best_params_selected"]),
                },
            ]
        )
        df_tuning.to_excel(
            writer,
            sheet_name="Hyperparameter Tuning",
            index=False,
        )

        df_ranking = pd.DataFrame(res["ranking"]).rename(
            columns={
                "rank": "Peringkat",
                "name": "Nama Fitur",
                "score": "Skor Kepentingan",
                "status": "Status",
            }
        )
        df_ranking.to_excel(writer, sheet_name="Seleksi Fitur", index=False)

        df_chart = pd.DataFrame(
            {
                "Tanggal": res["test_dates_all"],
                "Harga Aktual (Rp)": [
                    round(val, 2) for val in res["test_actual_all"]
                ],
                "SVR Selected (Rp)": [
                    round(val, 2) for val in res["test_svr_sel_all"]
                ],
                "RF Selected (Rp)": [
                    round(val, 2) for val in res["test_rf_sel_all"]
                ],
                "SVR All (Rp)": [
                    round(val, 2) for val in res["test_svr_all_all"]
                ],
                "RF All (Rp)": [
                    round(val, 2) for val in res["test_rf_all_all"]
                ],
            }
        )
        df_chart.to_excel(
            writer, sheet_name="Aktual vs Prediksi", index=False
        )

        df_training_res = pd.DataFrame(
            {
                "Tanggal": res["train_dates_all"],
                "Harga Aktual (Rp)": [
                    round(val, 2) for val in res["train_actual_all"]
                ],
                "SVR Selected (Rp)": [
                    round(val, 2) for val in res["train_svr_sel_all"]
                ],
                "RF Selected (Rp)": [
                    round(val, 2) for val in res["train_rf_sel_all"]
                ],
                "SVR All (Rp)": [
                    round(val, 2) for val in res["train_svr_all_all"]
                ],
                "RF All (Rp)": [
                    round(val, 2) for val in res["train_rf_all_all"]
                ],
            }
        )
        df_training_res.to_excel(
            writer, sheet_name="Hasil Training Model", index=False
        )

    output.seek(0)
    return StreamingResponse(
        output,
        headers={
            "Content-Disposition": (
                'attachment; filename="Laporan_Prediksi_Saham_BBRI.xlsx"'
            )
        },
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
    )