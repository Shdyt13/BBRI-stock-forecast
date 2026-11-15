<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" width="140" alt="Logo BBRI" />

# ⚙️ Backend API — Sistem Prediksi Harga Saham BBRI
### *Implementasi Pipeline Machine Learning (SVR & Random Forest Regressor)*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.0%2B-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

> **Penulis:** Oldyn Septiana Sinurat (NIM. 2101020075)  
> **Institusi:** Program Studi Teknik Informatika, Fakultas Teknik dan Teknologi Kemaritiman, Universitas Maritim Raja Ali Haji (UMRAH), Tanjungpinang, 2026

---

## 📖 1. Deskripsi Modul Backend

Modul `backend` ini merupakan layanan RESTful API berbasis **FastAPI** yang menjalankan keseluruhan alur kerja (*pipeline*) komputasi *Machine Learning* untuk penelitian **"Analisis Perbandingan Support Vector Regression dan Random Forest Regressor dengan Seleksi Fitur pada Prediksi Harga Saham BBRI"**.

Seluruh proses dirancang bebas dari *data leakage* (*zero look-ahead bias*), di mana parameter normalisasi (`MinMaxScaler`), seleksi fitur (*Feature Importance*), dan pencarian *hyperparameter* (`GridSearchCV` + `TimeSeriesSplit`) **hanya** dipelajari dari *Dataset Training*.

---

## 🔬 2. Tahapan *Machine Learning Pipeline* (`ml_pipeline.py`)

1. **Pembersihan Data (*Data Cleaning*):**
   - Menstandarkan format penulisan angka (menghapus koma pemisah ribuan dan mengonversi ke tipe `float`).
   - Mengurutkan observasi secara kronologis berdasarkan kolom `Date`.
   - Mengeliminasi baris yang memiliki nilai kosong (*missing values*) pada kolom tanggal maupun keenam variabel fitur (`dropna`).
2. **Transformasi Target (*Log Return*):**
   - Mengubah harga penutupan (`Close`) menjadi *Log Return* harian untuk menstabilkan varians dan mencapai sifat stasioneritas:
     $$\text{Log\_Return}_t = \ln\left(\frac{\text{Close}_t}{\text{Close}_{t-1}}\right)$$
3. **Pembentukan Pasangan Input & Target (*One-Step-Ahead*):**
   - Setiap vektor fitur hari ke-$t$ ($X_t = [\text{Open}_t, \text{High}_t, \text{Low}_t, \text{Close}_t, \text{Adj Close}_t, \text{Volume}_t]$) dipasangkan dengan target $\text{Target\_Log\_Return}_t = \text{Log\_Return}_{t+1}$ menggunakan operasi `shift(-1)`.
4. **Normalisasi Fitur (*Min-Max Scaling*):**
   - Menyetarakan rentang keenam fitur ke dalam skala `[0, 1]`. Proses `fit_transform` hanya dijalankan pada `X_train`, sedangkan `X_test` menggunakan `transform`.
5. **Seleksi Fitur (*Random Forest Feature Importance*):**
   - Mengevaluasi tingkat kontribusi fitur menggunakan `RandomForestRegressor(n_estimators=100, random_state=42)` pada data latih dan memilih **4 fitur terbaik (*Top-4*)**: `Volume`, `Adj Close`, `High`, dan `Open`.
6. **Pelatihan & Optimasi *Hyperparameter* (`GridSearchCV`):**
   - Menggunakan validasi silang runtun waktu `TimeSeriesSplit(n_splits=5)` pada dua skenario (*All Features* & *Selected Top-4*):
     - **SVR (Kernel RBF):** `C`: `[0.1, 1, 10, 100]`, `epsilon`: `[0.01, 0.1, 0.2]`, `gamma`: `['scale', 'auto']`
     - **Random Forest Regressor:** `n_estimators`: `[50, 100]`, `max_depth`: `[None, 10, 20]`, `min_samples_split`: `[2, 5]`
7. **Konversi Harga & Evaluasi Metrik:**
   - Hasil prediksi *Log Return* dikonversi kembali ke harga penutupan Rupiah ($\widehat{\text{Close}}_{t+1} = \text{Close}_t \times e^{\widehat{\text{Log\_Return}}_{t+1}}$) dan dievaluasi dengan metrik **MAE**, **RMSE**, dan **Koefisien Determinasi ($R^2$)**.

---

## 📊 3. Ringkasan Hasil Eksperimen

| Metrik Evaluasi | SVR (All Features) 🏆 | SVR (Selected Top-4) | RF (All Features) | RF (Selected Top-4) |
| :--- | :---: | :---: | :---: | :---: |
| **MAE** | **`50,8491`** | `53,5750` | `63,2128` | `63,2003` |
| **RMSE** | **`72,8695`** | `76,1198` | `89,4115` | `86,9473` |
| **$R^2$** | **`0,9902`** | `0,9894` | `0,9853` | `0,9861` |

---

## 🔌 4. Daftar Endpoint API (`main.py`)

| Method | Endpoint | Fungsi |
| :---: | :--- | :--- |
| `POST` | `/api/upload` | Menerima unggahan `training_file` & `testing_file` berformat CSV dan menyimpan dataset hasil pra-pemrosesan. |
| `POST` | `/api/predict` | Mengeksekusi pelatihan, seleksi fitur, evaluasi model, serta prediksi $T+1$, lalu menyimpannya di `PREDICTION_CACHE`. |
| `GET` | `/api/export-excel` | Menghasilkan file `Laporan_Prediksi_Saham_BBRI.xlsx` (5 *sheet*: *Ringkasan & Evaluasi*, *Hyperparameter Tuning*, *Seleksi Fitur*, *Aktual vs Prediksi*, dan *Hasil Training Model*). |

---

## 🚀 5. Cara Menjalankan Server Backend

### Opsi A — Menjalankan dengan Python Lokal
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Opsi B — Menjalankan dengan Docker Compose
```bash
docker compose up --build -d
```

Setelah aktif, server dapat diakses melalui:
- **Base URL:** `http://localhost:8000`
- **Swagger UI (Dokumentasi API Interaktif):** `http://localhost:8000/docs`

---

<div align="center">
  <i>Dokumen README ini merupakan bagian dari implementasi sistem untuk penelitian Tugas Akhir di Universitas Maritim Raja Ali Haji (UMRAH).</i>
</div>
