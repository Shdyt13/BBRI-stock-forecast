<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" width="140" alt="Logo BBRI" />

# 📈 Sistem Prediksi Harga Saham BBRI
### *Analisis Perbandingan Support Vector Regression dan Random Forest Regressor dengan Seleksi Fitur pada Prediksi Harga Saham BBRI*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 👨‍🎓 Informasi Penelitian

| Atribut | Keterangan |
| :--- | :--- |
| **Judul Tugas Akhir** | Analisis Perbandingan *Support Vector Regression* dan *Random Forest Regressor* dengan Seleksi Fitur pada Prediksi Harga Saham BBRI |
| **Penulis** | **Oldyn Septiana Sinurat** (NIM. 2101020075) |
| **Program Studi** | Teknik Informatika — Fakultas Teknik dan Teknologi Kemaritiman |
| ** Perguruan Tinggi** | Universitas Maritim Raja Ali Haji (UMRAH), Tanjungpinang (2026) |
| **Objek & Periode Data** | Saham PT Bank Rakyat Indonesia (Persero) Tbk (`BBRI.JK`) • `02 Januari 2015 – 30 Desember 2025` (2.711 Hari Perdagangan) |

> **Disclaimer:** Proyek ini dikembangkan untuk keperluan akademis dan penelitian Tugas Akhir (Skripsi). Hasil prediksi sistem merupakan purwarupa *Decision Support System* (DSS) dan **bukan** rekomendasi jual/beli instrumen keuangan secara langsung.

---

## ✨ Fitur Utama Sistem

- **📥 Unggah Dataset Terpisah (*Train & Test*):** Mendukung unggah file CSV *Dataset Training* (`2.168` baris) dan *Dataset Testing* (`543` baris) dengan ekstraksi metadata otomatis (rentang tanggal, total observasi, jumlah variabel).
- **🧠 Perbandingan Dua Algoritma & Dua Skenario:**
  - **Algoritma:** *Support Vector Regression* (SVR Kernel RBF) vs. *Random Forest Regressor* (RFR).
  - **Skenario 1 (*All Features*):** Menggunakan seluruh 6 variabel pasar dasar (`Open`, `High`, `Low`, `Close`, `Adj Close`, `Volume`).
  - **Skenario 2 (*Selected Top-4*):** Menggunakan 4 fitur terbaik hasil seleksi *Random Forest Feature Importance* (`Volume`, `Adj Close`, `High`, `Open`).
- **📊 Visualisasi Interaktif 3 Menu Utama:**
  - **Dashboard:** Pengaturan skenario prediksi, grafik perbandingan harga aktual vs. prediksi (50 data pengujian terakhir), dan kartu ringkasan target perdagangan $T+1$ beserta *tooltip* analisis presisi & akurasi.
  - **Feature Selection:** Kartu ringkasan seleksi fitur, tabel peringkat *Feature Importance* (`Selected` vs. `Dropped`), dan grafik batang horizontal kontribusi fitur.
  - **Model Evaluation:** Tabel perbandingan metrik evaluasi serta grafik terpisah untuk **Metrik Error (MAE & RMSE)** dan **Koefisien Determinasi ($R^2$)**.
- **📑 Ekspor Laporan Excel Lengkap (`.xlsx`):** Mengunduh file `Laporan_Prediksi_Saham_BBRI.xlsx` yang memuat **5 *sheet* komprehensif**:
  1. `Ringkasan & Evaluasi`
  2. `Hyperparameter Tuning`
  3. `Seleksi Fitur`
  4. `Aktual vs Prediksi` (Seluruh 542 data pengujian)
  5. `Hasil Training Model` (Seluruh 2.168 data pelatihan)

---

## 🏗️ Arsitektur Sistem

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND — React 19                           │
│           Vite • Tailwind CSS • Recharts • Lucide Icons              │
│             Dashboard │ Feature Selection │ Model Evaluation         │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ REST API (JSON / Multipart / Blob)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND — FastAPI                             │
│              Python • FastAPI • Uvicorn • OpenPyXL                   │
│          POST /api/upload │ POST /api/predict │ GET /api/export-excel│
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   MACHINE LEARNING PIPELINE                          │
│  1. Data Cleaning (Konversi Numerik, Pengurutan Kronologis, DropNA)  │
│  2. Transformasi Target ke Log Return: ln(Close_t / Close_{t-1})     │
│  3. Pembentukan Pasangan One-Step-Ahead: X_t -> Target_Log_Return_t+1│
│  4. Normalisasi Min-Max Scaling [0, 1] (Fit hanya pada Data Latih)   │
│  5. Seleksi Fitur: Random Forest Feature Importance (Top-4 Features) │
│  6. Optimasi Hyperparameter: GridSearchCV + TimeSeriesSplit (5-Fold) │
│  7. Rekonstruksi Harga: Close_hat_{t+1} = Close_t * exp(r_hat_{t+1}) │
│  8. Evaluasi Kinerja: MAE, RMSE, dan Koefisien Determinasi (R²)      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Ringkasan Hasil Penelitian

### 1. Hasil Seleksi Fitur (*Random Forest Feature Importance*)

| Peringkat | Nama Fitur | Skor Kepentingan | Persentase | Status |
| :---: | :--- | :---: | :---: | :---: |
| **1** | **Volume** | `0,321` | `32,1%` | ✅ **Selected** |
| **2** | **Adj Close** | `0,160` | `16,0%` | ✅ **Selected** |
| **3** | **High** | `0,148` | `14,8%` | ✅ **Selected** |
| **4** | **Open** | `0,148` | `14,8%` | ✅ **Selected** |
| 5 | Close | `0,114` | `11,4%` | ❌ Dropped |
| 6 | Low | `0,107` | `10,7%` | ❌ Dropped |

### 2. Perbandingan Metrik Evaluasi Model (Skenario 1 vs. Skenario 2)

| Metrik | SVR (All Features) 🏆 | SVR (Selected Top-4) | Random Forest (All Features) | Random Forest (Selected Top-4) |
| :--- | :---: | :---: | :---: | :---: |
| **MAE (Rp)** | **`50,8491`** | `53,5750` | `63,2128` | `63,2003` |
| **RMSE (Rp)** | **`72,8695`** | `76,1198` | `89,4115` | `86,9473` |
| **$R^2$ (R-Squared)** | **`0,9902`** | `0,9894` | `0,9853` | `0,9861` |

> **Kesimpulan Utama:**
> - **SVR (All Features)** memberikan kinerja paling superior dengan **$R^2 = 0,9902$**, **RMSE = $72,8695$**, dan **MAE = $50,8491$**.
> - **Seleksi Fitur (Top-4)** terbukti efektif menurunkan tingkat kesalahan pada **Random Forest** (RMSE turun dari `89,4115` menjadi `86,9473`, $R^2$ naik dari `0,9853` menjadi `0,9861`), namun sedikit menurunkan performa SVR karena kernel RBF bekerja lebih optimal memanfaatkan seluruh dimensi fitur dalam membentuk *hyperplane*.

### 3. Hasil *Hyperparameter Tuning* (`GridSearchCV` + `TimeSeriesSplit`)

| Skenario & Model | Parameter Terbaik (*Best Parameters*) |
| :--- | :--- |
| **SVR (All Features)** | `C = 10`, `epsilon = 0.01`, `gamma = 'auto'` |
| **Random Forest (All Features)** | `max_depth = 10`, `min_samples_split = 5`, `n_estimators = 100` |
| **SVR (Selected Top-4)** | `C = 10`, `epsilon = 0.01`, `gamma = 'auto'` |
| **Random Forest (Selected Top-4)** | `max_depth = 10`, `min_samples_split = 2`, `n_estimators = 50` |

---

## 🔌 Dokumentasi Endpoint API (FastAPI)

Dokumentasi interaktif Swagger UI dapat diakses pada `http://localhost:8000/docs`.

| Method | Endpoint | Deskripsi |
| :---: | :--- | :--- |
| `POST` | `/api/upload` | Mengunggah `training_file` & `testing_file` (CSV), menjalankan pra-pemrosesan data, dan mengembalikan metadata dataset. |
| `POST` | `/api/predict` | Menjalankan seleksi fitur, pelatihan SVR & RFR (2 skenario), evaluasi metrik (MAE, RMSE, $R^2$), serta proyeksi harga $T+1$. |
| `GET` | `/api/export-excel` | Mengunduh laporan lengkap `Laporan_Prediksi_Saham_BBRI.xlsx` (5 *sheet*). |

---

## 📂 Struktur Direktori Proyek

```text
BBRI-Stock-Forecast/
├── backend/                        # Layanan Backend API (FastAPI & Scikit-Learn)
│   ├── data/                       # Penyimpanan dataset yang telah diunggah & diproses
│   ├── main.py                     # Konfigurasi endpoint FastAPI & ekspor laporan Excel
│   ├── ml_pipeline.py              # Modul Preprocessing, Feature Selection, SVR & RFR
│   ├── Dockerfile                  # Konfigurasi container Docker untuk backend
│   ├── requirements.txt            # Daftar dependensi paket Python
│   └── README.md                   # Dokumentasi teknis khusus modul backend
│
├── frontend/                       # Antarmuka Pengguna (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/                 # Aset gambar & logo BBRI
│   │   ├── App.jsx                 # Komponen utama aplikasi (Dashboard, Feature Selection, Evaluation)
│   │   ├── main.jsx                # Entry point aplikasi React
│   │   └── index.css               # Konfigurasi styling Tailwind CSS
│   ├── Dockerfile                  # Konfigurasi container Docker untuk frontend
│   ├── package.json                # Dependensi & skrip NPM frontend
│   └── README.md                   # Dokumentasi teknis khusus modul frontend
│
├── Data_Training.csv               # Dataset Latih BBRI (02 Jan 2015 – 02 Okt 2023 | 2.168 baris)
├── Data_Testing.csv                # Dataset Uji BBRI (03 Okt 2023 – 30 Des 2025 | 543 baris)
├── docker-compose.yml              # Orkestrasi container Docker
├── START_DEV.bat                   # Skrip otomatis menjalankan Backend & Frontend (Windows)
└── README.md                       # Dokumentasi utama repositori
```

---

## 🚀 Panduan Instalasi & Menjalankan Sistem

### Opsi 1 — Menjalankan Secara Lokal (Mode Pengembangan)

#### 1. Jalankan Server Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> Server API aktif di `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`).

#### 2. Jalankan Antarmuka Frontend (React + Vite)
Buka terminal baru pada direktori proyek:
```bash
cd frontend
npm install
npm run dev
```
> Aplikasi web dapat diakses melalui browser di `http://localhost:5173`.

---

### Opsi 2 — Menggunakan Docker Compose 🐳

Pastikan **Docker Desktop** telah aktif, lalu jalankan perintah berikut dari direktori utama (*root*):
```bash
docker compose up --build -d
```
Untuk menghentikan layanan container:
```bash
docker compose down
```

---

<div align="center">

**Program Studi Teknik Informatika — Fakultas Teknik dan Teknologi Kemaritiman**  
**Universitas Maritim Raja Ali Haji (UMRAH) • 2026**

</div>
