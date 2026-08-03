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
    if not os.path.exists(TEMP_DATA_PATH):
        return {"error": "Dataset belum diunggah."}
        
    df = pd.read_csv(TEMP_DATA_PATH)
    X = df[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    y = df['Log_Return']
    
    # Panggil fungsi ML asli
    ranking_fitur = select_features(X, y)
    
    return {"features": ranking_fitur}

@app.post("/api/predict")
async def run_prediction():
    if not os.path.exists(TEMP_DATA_PATH):
        return {"error": "Dataset belum diunggah."}
        
    df = pd.read_csv(TEMP_DATA_PATH)
    y = df['Log_Return']
    split_idx = int(len(df) * 0.8)
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # ==========================================
    # SKENARIO 1: ALL FEATURES
    # ==========================================
    X_all = df[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    X_all_train, X_all_test = X_all.iloc[:split_idx], X_all.iloc[split_idx:]
    
    metrics_all, svr_pred_all, rf_pred_all = train_and_evaluate_models(X_all_train, y_train, X_all_test, y_test)
    
    # ==========================================
    # SKENARIO 2: SELECTED FEATURES (Top 4)
    # ==========================================
    # Menjalankan feature selection otomatis untuk mengambil 4 teratas
    ranking = select_features(X_all, y)
    top_4_features = [f['name'] for f in ranking if f['status'] == 'selected']
    
    X_sel = df[top_4_features]
    X_sel_train, X_sel_test = X_sel.iloc[:split_idx], X_sel.iloc[split_idx:]
    
    metrics_sel, svr_pred_sel, rf_pred_sel = train_and_evaluate_models(X_sel_train, y_train, X_sel_test, y_test)
    
    # Gabungkan hasil untuk dikirim ke Frontend
    return {
        "message": "Eksperimen Dua Skenario Berhasil!",
        "metrics": {
            "All_Features": metrics_all,
            "Selected_Features": metrics_sel
        },
        "chart_data": {
            "actual": y_test.tail(50).tolist(),
            "svr_all": svr_pred_all[-50:].tolist(),
            "rf_all": rf_pred_all[-50:].tolist(),
            "svr_selected": svr_pred_sel[-50:].tolist(),
            "rf_selected": rf_pred_sel[-50:].tolist(),
        }
    }