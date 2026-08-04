from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
import numpy as np
import io
import os

from ml_pipeline import (
    preprocess_data,
    create_next_day_target,
    scale_features,
    select_features,
    train_and_evaluate_models,
    FEATURES
)


app = FastAPI(
    title="API Prediksi Saham BBRI"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DIRECTORY
# =========================================================

os.makedirs("data", exist_ok=True)

TEMP_DATA_PATH = "data/temp_data.csv"
RAW_DATA_PATH = "data/raw_data.csv"


# =========================================================
# UPLOAD DATASET
# =========================================================

@app.post("/api/upload")
async def upload_dataset(
    file: UploadFile = File(...)
):

    contents = await file.read()

    df = pd.read_csv(
        io.StringIO(
            contents.decode("utf-8")
        )
    )

    # Simpan raw data
    df.to_csv(
        RAW_DATA_PATH,
        index=False
    )

    # Preprocessing
    df_clean = preprocess_data(df)

    # Bentuk target hari berikutnya
    df_model = create_next_day_target(
        df_clean
    )

    df_model.to_csv(
        TEMP_DATA_PATH,
        index=False
    )

    return {
        "message": "Dataset berhasil diunggah dan diproses!",
        "rows": len(df_model),
        "last_date": str(
            df_model["Date"].iloc[-1]
        )
    }


# =========================================================
# PREDICTION
# =========================================================

@app.post("/api/predict")
async def run_prediction():

    if not os.path.exists(
        TEMP_DATA_PATH
    ):
        return {
            "error":
            "Dataset belum diunggah."
        }

    df = pd.read_csv(
        TEMP_DATA_PATH
    )

    df["Date"] = pd.to_datetime(
        df["Date"]
    )

    # =====================================================
    # DATA UNTUK MODEL
    # =====================================================

    # Baris terakhir tidak memiliki
    # target hari berikutnya
    model_df = df.dropna(
        subset=["Target_Log_Return"]
    ).copy()

    X = model_df[FEATURES]

    y = model_df[
        "Target_Log_Return"
    ]

    # =====================================================
    # TIME SERIES SPLIT 80:20
    # =====================================================

    split_idx = int(
        len(model_df) * 0.8
    )

    X_train = X.iloc[
        :split_idx
    ]

    X_test = X.iloc[
        split_idx:
    ]

    y_train = y.iloc[
        :split_idx
    ]

    y_test = y.iloc[
        split_idx:
    ]

    # =====================================================
    # NORMALISASI
    # =====================================================

    (
        X_train_scaled,
        X_test_scaled,
        _,
        scaler
    ) = scale_features(
        X_train,
        X_test
    )

    # =====================================================
    # SCENARIO 1
    # ALL FEATURES
    # =====================================================

    (
        metrics_all,
        svr_pred_all,
        rf_pred_all,
        svr_model_all,
        rf_model_all
    ) = train_and_evaluate_models(
        X_train_scaled,
        y_train,
        X_test_scaled,
        y_test
    )

    # =====================================================
    # FEATURE SELECTION
    # =====================================================

    ranking = select_features(
        X_train_scaled,
        y_train,
        top_k=4
    )

    selected_features = [
        item["name"]
        for item in ranking
        if item["status"] == "selected"
    ]

    # =====================================================
    # SCENARIO 2
    # SELECTED FEATURES
    # =====================================================

    X_train_selected = (
        X_train_scaled[
            selected_features
        ]
    )

    X_test_selected = (
        X_test_scaled[
            selected_features
        ]
    )

    (
        metrics_selected,
        svr_pred_selected,
        rf_pred_selected,
        svr_model_selected,
        rf_model_selected
    ) = train_and_evaluate_models(
        X_train_selected,
        y_train,
        X_test_selected,
        y_test
    )

    # =====================================================
    # FUTURE PREDICTION (PREDIKSI MASA DEPAN)
    # =====================================================

    # Ambil baris terakhir yang sebenarnya
    latest_row = df.iloc[[-1]]

    last_date = latest_row["Date"].iloc[0]
    last_close = float(latest_row["Close"].iloc[0])

    latest_X = latest_row[FEATURES]

    # Normalisasi menggunakan scaler (ALL FEATURES)
    latest_X_scaled = pd.DataFrame(
        scaler.transform(latest_X),
        columns=FEATURES
    )

    # Normalisasi menggunakan scaler (SELECTED FEATURES)
    latest_X_selected = latest_X_scaled[selected_features]

    # --- PREDIKSI: SELECTED FEATURES ---
    pred_log_return_svr_sel = float(svr_model_selected.predict(latest_X_selected)[0])
    pred_log_return_rf_sel = float(rf_model_selected.predict(latest_X_selected)[0])
    
    pred_close_svr_sel = last_close * np.exp(pred_log_return_svr_sel)
    pred_close_rf_sel = last_close * np.exp(pred_log_return_rf_sel)

    # --- PREDIKSI: ALL FEATURES ---
    pred_log_return_svr_all = float(svr_model_all.predict(latest_X_scaled)[0])
    pred_log_return_rf_all = float(rf_model_all.predict(latest_X_scaled)[0])
    
    pred_close_svr_all = last_close * np.exp(pred_log_return_svr_all)
    pred_close_rf_all = last_close * np.exp(pred_log_return_rf_all)

    # =====================================================
    # TANGGAL PREDIKSI
    # =====================================================
    prediction_date = "2026-01-02"

    # =====================================================
    # DENORMALISASI DATA GRAFIK (50 DATA TERAKHIR)
    # =====================================================
    last_50_close = model_df["Close"].iloc[split_idx:].tail(50).values
    
    actual_prices = last_50_close * np.exp(y_test.tail(50).values)
    
    svr_sel_prices = last_50_close * np.exp(svr_pred_selected[-50:])
    rf_sel_prices = last_50_close * np.exp(rf_pred_selected[-50:])
    
    svr_all_prices = last_50_close * np.exp(svr_pred_all[-50:])
    rf_all_prices = last_50_close * np.exp(rf_pred_all[-50:])

    return {
        "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
        "prediction": {
            "base_date": last_date.strftime("%Y-%m-%d"),
            "prediction_date": prediction_date,
            "last_actual_close": round(last_close, 2),
            "Selected_Features": {
                "SVR": round(pred_close_svr_sel, 2),
                "RandomForest": round(pred_close_rf_sel, 2)
            },
            "All_Features": {
                "SVR": round(pred_close_svr_all, 2),
                "RandomForest": round(pred_close_rf_all, 2)
            }
        },
        "feature_selection": {
            "selected_features": selected_features,
            "ranking": ranking
        },
        "metrics": {
            "All_Features": metrics_all,
            "Selected_Features": metrics_selected
        },
        "chart_data": {
            "actual": [round(float(val), 2) for val in actual_prices],
            "svr_selected": [round(float(val), 2) for val in svr_sel_prices],
            "rf_selected": [round(float(val), 2) for val in rf_sel_prices],
            "svr_all": [round(float(val), 2) for val in svr_all_prices],
            "rf_all": [round(float(val), 2) for val in rf_all_prices]
        }
    }