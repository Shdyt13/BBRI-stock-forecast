import io
import os
from fastapi import FastAPI, File, UploadFile
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

TEMP_DATA_PATH = "data/temp_data.csv"
RAW_DATA_PATH = "data/raw_data.csv"

# =========================================================
# GLOBAL CACHE: MEMORI SEMENTARA AGAR DOWNLOAD EXCEL INSTAN
# =========================================================
PREDICTION_CACHE = {}


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    df.to_csv(RAW_DATA_PATH, index=False)

    df_clean = preprocess_data(df)
    df_model = create_next_day_target(df_clean)
    df_model.to_csv(TEMP_DATA_PATH, index=False)

    # Kosongkan cache lama jika ada upload dataset baru
    PREDICTION_CACHE.clear()

    return {
        "message": "Dataset berhasil diunggah dan diproses!",
        "rows": len(df_model),
        "last_date": pd.to_datetime(df_model["Date"].iloc[-1]).strftime(
            "%d %B %Y"
        ),
    }


def compute_prediction_pipeline():
    if not os.path.exists(TEMP_DATA_PATH):
        return None

    df = pd.read_csv(TEMP_DATA_PATH)
    df["Date"] = pd.to_datetime(df["Date"])

    model_df = df.dropna(subset=["Target_Log_Return"]).copy()

    X = model_df[FEATURES]
    y = model_df["Target_Log_Return"]
    split_idx = int(len(model_df) * 0.8)

    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    prev_close_test = model_df["Close"].iloc[split_idx:]

    X_train_scaled, X_test_scaled, _, scaler = scale_features(X_train, X_test)

    # Skenario 1: All Features
    (
        metrics_all,
        svr_pred_all,
        rf_pred_all,
        svr_model_all,
        rf_model_all,
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
    ) = train_and_evaluate_models(
        X_train_selected, y_train, X_test_selected, y_test, prev_close_test
    )

    # Prediksi Masa Depan (02 Jan 2026)
    latest_row = df.iloc[[-1]]
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

    prediction_date = "02 Januari 2026"
    actual_target_close = 3640.0

    # Data 50 hari terakhir
    last_50_dates = (
        model_df["Date"]
        .iloc[split_idx:]
        .tail(50)
        .dt.strftime("%Y-%m-%d")
        .values
    )
    last_50_close = model_df["Close"].iloc[split_idx:].tail(50).values

    actual_prices = [
        clean_float(val)
        for val in (last_50_close * np.exp(y_test.tail(50).values))
    ]
    svr_sel_prices = [clean_float(val) for val in svr_pred_selected[-50:]]
    rf_sel_prices = [clean_float(val) for val in rf_pred_selected[-50:]]
    svr_all_prices = [clean_float(val) for val in svr_pred_all[-50:]]
    rf_all_prices = [clean_float(val) for val in rf_pred_all[-50:]]

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
    }


@app.post("/api/predict")
async def run_prediction():
    res = compute_prediction_pipeline()
    if res is None:
        return {"error": "Dataset belum diunggah."}

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
                    "Keterangan": "Aktual Pasar (02 Jan 2026)",
                    "Nilai": round(res["actual_target_close"], 2),
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
                "Tanggal": res["dates_50"],
                "Harga Aktual (Rp)": [
                    round(val, 2) for val in res["actual_prices"]
                ],
                "SVR Selected (Rp)": [
                    round(val, 2) for val in res["svr_sel_prices"]
                ],
                "RF Selected (Rp)": [
                    round(val, 2) for val in res["rf_sel_prices"]
                ],
                "SVR All (Rp)": [
                    round(val, 2) for val in res["svr_all_prices"]
                ],
                "RF All (Rp)": [round(val, 2) for val in res["rf_all_prices"]],
            }
        )
        df_chart.to_excel(
            writer, sheet_name="Aktual vs Prediksi", index=False
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