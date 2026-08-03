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
    # FUTURE PREDICTION
    # =====================================================

    # Ambil baris terakhir yang sebenarnya
    # yaitu 30 Desember 2025
    latest_row = df.iloc[[-1]]

    last_date = latest_row[
        "Date"
    ].iloc[0]

    last_close = float(
        latest_row[
            "Close"
        ].iloc[0]
    )

    # Fitur tanggal terakhir
    latest_X = latest_row[
        FEATURES
    ]

    # Normalisasi menggunakan scaler
    # yang FIT pada data training
    latest_X_scaled = pd.DataFrame(
        scaler.transform(
            latest_X
        ),
        columns=FEATURES
    )

    # Fitur terpilih
    latest_X_selected = (
        latest_X_scaled[
            selected_features
        ]
    )

    # =====================================================
    # PREDICT NEXT TRADING DAY
    # =====================================================

    predicted_log_return_svr = float(
        svr_model_selected.predict(
            latest_X_selected
        )[0]
    )

    predicted_log_return_rf = float(
        rf_model_selected.predict(
            latest_X_selected
        )[0]
    )

    # =====================================================
    # LOG RETURN → CLOSE PRICE
    # =====================================================

    predicted_close_svr = (
        last_close
        * np.exp(
            predicted_log_return_svr
        )
    )

    predicted_close_rf = (
        last_close
        * np.exp(
            predicted_log_return_rf
        )
    )

    # =====================================================
    # TANGGAL PREDIKSI
    # =====================================================

    # Karena target adalah next trading day,
    # ambil Target_Date dari baris terakhir
    #
    # Jika dataset hanya sampai 30 Des 2025,
    # Target_Date belum tersedia.
    #
    # Oleh karena itu kita gunakan tanggal
    # perdagangan berikutnya secara eksplisit.

    prediction_date = "2026-01-02"

    return {

        "message":
        "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",

        "prediction": {

            "base_date":
            last_date.strftime(
                "%Y-%m-%d"
            ),

            "prediction_date":
            prediction_date,

            "last_actual_close":
            round(
                last_close,
                2
            ),

            "SVR": {

                "predicted_log_return":
                predicted_log_return_svr,

                "predicted_close":
                round(
                    predicted_close_svr,
                    2
                )
            },

            "RandomForest": {

                "predicted_log_return":
                predicted_log_return_rf,

                "predicted_close":
                round(
                    predicted_close_rf,
                    2
                )
            }
        },

        "feature_selection": {

            "selected_features":
            selected_features,

            "ranking":
            ranking
        },

        "metrics": {

            "All_Features":
            metrics_all,

            "Selected_Features":
            metrics_selected
        },

        "chart_data": {

            "actual":
            y_test.tail(50).tolist(),

            "svr_selected":
            svr_pred_selected[-50:].tolist(),

            "rf_selected":
            rf_pred_selected[-50:].tolist()
        }
    }