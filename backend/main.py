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

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Proses pra-pemrosesan
    df_clean = preprocess_data(df)
    
    # Simpan dataframe yang sudah bersih ke file sementara
    df_clean.to_csv(TEMP_DATA_PATH, index=False)
    
    return {"message": "Dataset berhasil diunggah dan diproses!", "rows": len(df_clean)}

@app.get("/api/feature-selection")
async def get_feature_selection():
    # Saat ini masih menggunakan mock data agar UI Frontend bisa dibangun
    return {
        "features": [
            {"rank": 1, "name": "Open", "score": 0.312, "status": "selected"},
            {"rank": 2, "name": "High", "score": 0.312, "status": "selected"},
            {"rank": 3, "name": "Low", "score": 0.280, "status": "selected"},
            {"rank": 4, "name": "Close", "score": 0.250, "status": "selected"}
        ]
    }

@app.post("/api/predict")
async def run_prediction():
    # 1. Cek apakah dataset sudah diunggah
    if not os.path.exists(TEMP_DATA_PATH):
        return {"error": "Dataset belum diunggah. Silakan upload terlebih dahulu."}
        
    # 2. Baca data bersih
    df = pd.read_csv(TEMP_DATA_PATH)
    
    # 3. Tentukan Fitur (X) dan Target (y)
    # Untuk simulasi Skenario 'Selected Features', kita gunakan fitur dengan ranking teratas
    X = df[['Open', 'High', 'Low', 'Close']] 
    # Target prediksi sesuai proposal adalah Log Return (atau Close price ter-normalisasi)
    y = df['Log_Return'] 
    
    # 4. Pembagian Data (Time Series Split: 80% Training, 20% Testing)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # 5. Jalankan proses Training, Tuning (GridSearchCV), dan Evaluasi
    metrics, svr_pred, rf_pred = train_and_evaluate_models(X_train, y_train, X_test, y_test)
    
    # 6. Siapkan data untuk grafik UI (Ambil 50 data terakhir agar grafik tidak terlalu padat/ruwet)
    chart_data = {
        "actual": y_test.tail(50).tolist(),
        "svr_predicted": svr_pred[-50:].tolist(),
        "rf_predicted": rf_pred[-50:].tolist()
    }
    
    # 7. Kembalikan metrik dan data grafik ke Frontend
    return {
        "message": "Prediksi berhasil!",
        "metrics": metrics,
        "chart_data": chart_data
    }