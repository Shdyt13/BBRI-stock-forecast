from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

# Import fungsi dari ml_pipeline yang baru saja Anda buat
from ml_pipeline import preprocess_data, select_features, train_and_evaluate_models

app = FastAPI(title="API Prediksi Saham BBRI")

# Izinkan akses CORS agar Frontend (React) bisa berkomunikasi dengan API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    # Membaca file CSV yang diunggah
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Proses pra-pemrosesan
    df_clean = preprocess_data(df)
    
    return {"message": "Dataset berhasil diunggah dan diproses!", "rows": len(df_clean)}

@app.get("/api/feature-selection")
async def get_feature_selection():
    # Simulasi endpoint untuk mengembalikan ranking fitur ke Frontend
    return {
        "features": [
            {"rank": 1, "name": "Open", "score": 0.312, "status": "selected"},
            {"rank": 2, "name": "High", "score": 0.312, "status": "selected"}
        ]
    }

@app.post("/api/predict")
async def run_prediction():
    # Di sini nanti Anda akan memanggil fungsi train_and_evaluate_models
    # dan mengembalikan metrik evaluasi (MAE, RMSE, R2) ke Frontend
    return {"message": "Proses training dan prediksi berhasil dijalankan."}