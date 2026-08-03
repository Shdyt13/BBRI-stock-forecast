from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os

# Import fungsi dari ml_pipeline 
from ml_pipeline import preprocess_data, select_features, train_and_evaluate_models

app = FastAPI(title="API Prediksi Saham BBRI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Buat folder 'data' secara otomatis jika belum ada untuk menyimpan file sementara
os.makedirs("data", exist_ok=True)
TEMP_DATA_PATH = "data/temp_data.csv"

RAW_DATA_PATH = "data/raw_data.csv"

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # BARU: Simpan data mentah agar kita tahu harga asli (belum dinormalisasi)
    df.to_csv(RAW_DATA_PATH, index=False)
    
    df_clean = preprocess_data(df)
    df_clean.to_csv(TEMP_DATA_PATH, index=False)
    
    return {"message": "Dataset berhasil diunggah dan diproses!", "rows": len(df_clean)}

# (Endpoint /api/feature-selection tetap sama)

@app.post("/api/predict")
async def run_prediction():
    if not os.path.exists(TEMP_DATA_PATH):
        return {"error": "Dataset belum diunggah."}
        
    df = pd.read_csv(TEMP_DATA_PATH)
    y = df['Log_Return']
    split_idx = int(len(df) * 0.8)
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Skenario 1: ALL FEATURES
    X_all = df[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    X_all_train, X_all_test = X_all.iloc[:split_idx], X_all.iloc[split_idx:]
    # Panggil dengan 5 variabel penampung
    metrics_all, svr_pred_all, rf_pred_all, svr_model_all, rf_model_all = train_and_evaluate_models(X_all_train, y_train, X_all_test, y_test)
    
    # Skenario 2: SELECTED FEATURES
    ranking = select_features(X_all, y)
    top_4_features = [f['name'] for f in ranking if f['status'] == 'selected']
    X_sel = df[top_4_features]
    X_sel_train, X_sel_test = X_sel.iloc[:split_idx], X_sel.iloc[split_idx:]
    # Panggil dengan 5 variabel penampung
    metrics_sel, svr_pred_sel, rf_pred_sel, svr_model_sel, rf_model_sel = train_and_evaluate_models(X_sel_train, y_train, X_sel_test, y_test)
    
    # ==========================================
    # LOGIKA PREDIKSI 1 HARI KE DEPAN (BESOK)
    # ==========================================
    import numpy as np # Pastikan numpy di-import
    
    # 1. Ambil data asli dari CSV mentah untuk mengetahui harga penutupan (Close) hari terakhir
    df_raw = pd.read_csv(RAW_DATA_PATH)
    actual_last_close = df_raw['Close'].dropna().iloc[-1]
    
    # 2. Ambil baris fitur paling terakhir dari dataset yang sudah diproses
    latest_X_sel = X_sel.iloc[[-1]]
    
    # 3. Minta model menebak "Log Return" untuk hari besok
    log_return_besok_svr = svr_model_sel.predict(latest_X_sel)[0]
    log_return_besok_rf = rf_model_sel.predict(latest_X_sel)[0]
    
    # 4. Konversi Log Return ke Harga Saham Rupiah: Harga_Besok = Harga_Hari_Ini * exp(Log_Return)
    harga_besok_svr = actual_last_close * np.exp(log_return_besok_svr)
    harga_besok_rf = actual_last_close * np.exp(log_return_besok_rf)
    
    return {
        "message": "Prediksi 1 Hari Ke Depan Berhasil!",
        "future_prediction": {
            "last_actual_price": round(actual_last_close, 2),
            "next_day_svr": round(harga_besok_svr, 2),
            "next_day_rf": round(harga_besok_rf, 2)
        },
        "metrics": {
            "All_Features": metrics_all,
            "Selected_Features": metrics_sel
        },
        "chart_data": {
            "actual": y_test.tail(50).tolist(),
            "svr_selected": svr_pred_sel[-50:].tolist(),
            "rf_selected": rf_pred_sel[-50:].tolist(),
        }
    }