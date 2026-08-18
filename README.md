# BBRI Stock Forecasting System

Aplikasi *full-stack* untuk memprediksi harga saham **PT Bank Rakyat Indonesia (BBRI)** menggunakan **Support Vector Regression (SVR)** dan **Random Forest Regression**, lengkap dengan seleksi fitur otomatis dan evaluasi model interaktif.

> **Disclaimer:** Proyek ini dibuat untuk tujuan edukasi/riset. Hasil prediksi **bukan** rekomendasi atau nasihat investasi.

---

## Fitur Utama

- **Upload dataset OHLCV** via drag-and-drop CSV, dengan parsing metadata otomatis (rentang tanggal, jumlah baris).
- **Prediksi harga penutupan hari perdagangan berikutnya** menggunakan dua model: **SVR (kernel RBF)** dan **Random Forest Regressor**.
- **Seleksi fitur otomatis** berbasis *Random Forest Feature Importance*, memilih Top-4 fitur terbaik dari 6 fitur yang tersedia.
- **Dua skenario prediksi** yang dapat dibandingkan langsung di dashboard: *All Features* vs *Selected Features (Top-4)*.
- **Evaluasi model** dengan metrik MAE, RMSE, dan R², divisualisasikan dalam tabel dan grafik batang.
- **Grafik interaktif** aktual vs prediksi (50 data uji terakhir) menggunakan Recharts.
- **Ekspor laporan ke Excel** (`.xlsx`) berisi ringkasan prediksi, metrik evaluasi, hasil ranking fitur, dan data grafik.

---

## Arsitektur Sistem

```text
┌───────────────────────────────────────────────────────────┐
│                    FRONTEND — React                        │
│         React 19 • Vite • Tailwind CSS • Recharts          │
│                      Port: 3000 / 5173                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (JSON, Axios)
                            ▼
┌───────────────────────────────────────────────────────────┐
│                    BACKEND — FastAPI                        │
│      Python 3.10 • FastAPI • Uvicorn • Scikit-learn         │
│                      Port: 8000                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ CSV Dataset (in-memory + data/*.csv)
                            ▼
┌───────────────────────────────────────────────────────────┐
│                     ML PIPELINE                             │
│  1. Data Cleaning & Log-Return Feature Engineering           │
│  2. Chronological Train/Test Split (80/20)                   │
│  3. Feature Selection (Random Forest Importance, Top-4)      │
│  4. Training SVR & Random Forest (GridSearchCV + TSCV)       │
│  5. Evaluasi (MAE, RMSE, R²)                                 │
│  6. Prediksi Hari Perdagangan Berikutnya                     │
└───────────────────────────────────────────────────────────┘
```

---

## Machine Learning Pipeline

### 1. Pra-pemrosesan Data

Dataset OHLCV dibersihkan (`preprocess_data`): pembersihan format angka, pengurutan kronologis, *forward/backward fill* untuk nilai kosong. Fitur digunakan:

```python
FEATURES = ["Open", "High", "Low", "Close", "Adj Close", "Volume"]
```

Fitur **Log Return** dihitung dari harga penutupan sebagai basis target prediksi (bukan sebagai fitur masukan model):

```python
df["Log_Return"] = np.log(df["Close"] / df["Close"].shift(1))
df["Target_Log_Return"] = df["Log_Return"].shift(-1)
```

Model tidak memprediksi harga secara langsung, melainkan memprediksi **log-return hari berikutnya**, yang kemudian dikonversi kembali ke harga:

```python
predicted_close = last_close * exp(predicted_log_return)
```

### 2. Split Data

Data dibagi secara **kronologis** (bukan acak) agar urutan waktu tetap terjaga:

```text
80% → Data Latih (Training)
20% → Data Uji (Testing)
```

### 3. Seleksi Fitur

Menggunakan **Random Forest feature importance** untuk meranking 6 fitur, lalu memilih **Top-4** secara default:

```python
select_features(X_train, y_train, top_k=4)
```

Hasil ranking beserta status `selected` / `dropped` ditampilkan di tab **Feature Selection** pada dashboard.

### 4. Normalisasi

Fitur dinormalisasi dengan **Min-Max Scaling** (`scaler.fit` hanya pada data latih, lalu diterapkan ke data uji).

### 5. Pelatihan Model

Kedua model dioptimasi dengan `GridSearchCV` menggunakan **`TimeSeriesSplit` (5 *fold*)** — bukan *k-fold* acak — agar validasi tetap menghormati urutan waktu.

**Support Vector Regression (kernel RBF):**

```python
param_grid = {
    "C": [0.1, 1, 10, 100],
    "epsilon": [0.01, 0.1, 0.2],
    "gamma": ["scale", "auto"],
}
```

**Random Forest Regressor:**

```python
param_grid = {
    "n_estimators": [50, 100],
    "max_depth": [None, 10, 20],
    "min_samples_split": [2, 5],
}
```

### 6. Evaluasi

Prediksi log-return dikonversi kembali ke skala harga sebelum dihitung metriknya:

- **MAE** (*Mean Absolute Error*)
- **RMSE** (*Root Mean Squared Error*)
- **R²** (*Coefficient of Determination*)

Metrik dihitung untuk kedua skenario (*All Features* & *Selected Features*) dan kedua model (SVR & Random Forest).

---

## Format Dataset

File CSV harus memiliki kolom berikut:

| Kolom | Keterangan |
|---|---|
| `Date` | Tanggal perdagangan (format `YYYY-MM-DD`) |
| `Open` | Harga pembukaan |
| `High` | Harga tertinggi |
| `Low` | Harga terendah |
| `Close` | Harga penutupan (basis target prediksi) |
| `Adj Close` | Harga penutupan yang disesuaikan |
| `Volume` | Volume perdagangan |

Contoh:

```csv
Date,Open,High,Low,Close,Adj Close,Volume
2015-01-05,3450.00,3480.00,3440.00,3470.00,3470.00,125000000
2015-01-06,3475.00,3490.00,3465.00,3485.00,3485.00,130000000
```

**Ketentuan tambahan:**
- Data terurut kronologis, disarankan minimal ±100 baris.
- Nilai OHLCV numerik dan tidak boleh kosong (baris dengan `Date` tidak valid akan dibuang secara otomatis).

---

## API Backend (FastAPI)

Dokumentasi interaktif (Swagger UI) tersedia otomatis di `http://localhost:8000/docs`.

### `POST /api/upload`

Mengunggah dataset CSV, membersihkan data, dan menyiapkannya untuk pipeline prediksi.

```http
POST /api/upload
Content-Type: multipart/form-data

file: <CSV file>
```

```json
{
  "message": "Dataset berhasil diunggah dan diproses!",
  "rows": 2500,
  "last_date": "30 December 2025"
}
```

### `POST /api/predict`

Menjalankan seluruh pipeline (seleksi fitur, training SVR & Random Forest untuk 2 skenario, evaluasi, dan prediksi hari berikutnya). Hasilnya disimpan sementara di memori server (`PREDICTION_CACHE`) agar ekspor Excel tidak perlu menghitung ulang.

```json
{
  "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
  "prediction": {
    "base_date": "30 December 2025",
    "prediction_date": "02 Januari 2026",
    "last_actual_close": 3660.0,
    "Selected_Features": { "SVR": 3720.5, "RandomForest": 3695.25 },
    "All_Features": { "SVR": 3710.0, "RandomForest": 3685.75 }
  },
  "feature_selection": { "selected_features": [...], "ranking": [...] },
  "metrics": { "All_Features": {...}, "Selected_Features": {...} },
  "chart_data": { "actual": [...], "svr_selected": [...], "...": "..." }
}
```

### `GET /api/export-excel`

Mengunduh laporan `Laporan_Prediksi_Saham_BBRI.xlsx` (3 sheet: *Ringkasan & Evaluasi*, *Seleksi Fitur*, *Aktual vs Prediksi*). Jika belum pernah menjalankan `/api/predict`, endpoint ini akan menjalankan pipeline terlebih dahulu.

> **Catatan implementasi saat ini:** tanggal prediksi (`02 Januari 2026`) dan nilai *benchmark* aktual (`3640.0`) pada `compute_prediction_pipeline()` masih *hard-coded* di `backend/main.py`, bukan dihitung dinamis dari data uji. Sesuaikan nilai ini bila digunakan dengan dataset yang berbeda.

---

## Struktur Proyek

```text
BBRI-stock-forecast/
├── backend/                    # Backend FastAPI aktif (digunakan oleh docker-compose.yml root)
│   ├── data/                   # Penyimpanan sementara dataset yang diunggah
│   ├── main.py                 # Endpoint API: /api/upload, /api/predict, /api/export-excel
│   ├── ml_pipeline.py          # Preprocessing, feature selection, training, evaluasi
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Dashboard React (Vite)
│   ├── src/
│   │   ├── App.jsx             # Komponen utama — dashboard 3 tab (self-contained, single file)
│   │   ├── components/         # Layout.jsx, Sidebar.jsx (scaffold, belum dipakai App.jsx)
│   │   ├── pages/               # Dashboard.jsx, FeatureSelection.jsx, ModelEvaluation.jsx (scaffold)
│   │   └── context/            # DataContext.jsx (scaffold)
│   ├── Dockerfile
│   └── package.json
│
├── backend-bbri/                # Salinan/versi lama backend (integrasi tim), tidak dipakai docker-compose root
├── dokumentasi/                 # Kumpulan catatan pengembangan & panduan (histori proyek)
├── docker-compose.yml           # Saat ini hanya mengorkestrasi service backend
├── START_DEV.bat / START_SEMUA.bat / START_DOCKER.bat / STOP_DOCKER.bat
└── README.md
```

> **Catatan:** Folder `frontend/src/pages/`, `components/`, dan `context/` berisi *scaffold* halaman multi-route yang **belum** diimpor oleh `App.jsx` — implementasi UI saat ini adalah satu komponen (`App.jsx`) dengan navigasi tab berbasis `useState`, bukan React Router. Folder `backend-bbri/` adalah salinan backend versi sebelumnya dan tidak digunakan oleh `docker-compose.yml` di root.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Axios, Lucide Icons |
| Backend | Python 3.10, FastAPI, Uvicorn |
| Machine Learning | Scikit-learn (SVR, Random Forest, GridSearchCV, TimeSeriesSplit) |
| Data Processing | Pandas, NumPy |
| Ekspor Laporan | openpyxl |
| DevOps | Docker, Docker Compose |

---

## Cara Menjalankan

### Opsi 1 — Docker (Backend)

```bash
docker-compose up --build
```

Backend akan aktif di `http://localhost:8000` (dokumentasi API: `http://localhost:8000/docs`).

> `docker-compose.yml` di root saat ini **hanya** mengorkestrasi container backend. Frontend tetap dijalankan terpisah (lihat Opsi 2), meskipun `frontend/Dockerfile` tersedia untuk build manual (`docker build -t bbri-frontend ./frontend`).

Menghentikan container:

```bash
docker-compose down
```

### Opsi 2 — Mode Pengembangan (tanpa Docker)

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
python main.py             # atau: uvicorn main:app --reload --port 8000
```

**Frontend** (terminal baru):

```bash
cd frontend
npm install
npm run dev
```

Dashboard dapat diakses di `http://localhost:5173` (mode `npm run dev`) atau `http://localhost:3000` bila dijalankan via container frontend.

### Skrip Bantu (Windows)

| Skrip | Fungsi |
|---|---|
| `INSTALL_DEPENDENCIES.bat` | Instalasi dependensi frontend & backend sekaligus |
| `START_DEV.bat` / `START_SEMUA.bat` | Menjalankan frontend + backend secara lokal |
| `START_DOCKER.bat` | Menjalankan backend via Docker Compose |
| `STOP_DOCKER.bat` | Menghentikan container Docker |

### Alur Penggunaan Dashboard

1. Unggah CSV dataset BBRI pada panel **Upload Dataset**.
2. Pilih mode **Ya (Seleksi Fitur)** atau **Tidak (Seluruh Fitur)**, lalu klik **RUN PREDICTION**.
3. Lihat hasil prediksi harga hari berikutnya (SVR & Random Forest) beserta grafik *actual vs prediction* di tab **Dashboard**.
4. Buka tab **Feature Selection** untuk melihat ranking fitur (Random Forest Importance).
5. Buka tab **Model Evaluation** untuk membandingkan MAE, RMSE, dan R² keempat kombinasi (SVR/RF × All/Selected Features).
6. Klik **Download Laporan Excel** untuk mengunduh laporan lengkap.

---

## Keterbatasan yang Diketahui

1. Tanggal prediksi dan harga *benchmark* aktual pada respons `/api/predict` masih statis (`hard-coded`) di `backend/main.py`, sehingga hasil paling akurat bila digunakan dengan dataset acuan yang sama seperti saat pengembangan.
2. Prediksi hanya untuk **1 hari perdagangan ke depan**; tidak ada opsi horizon multi-hari.
3. Belum ada penyimpanan model (*model persistence*) — setiap pemanggilan `/api/predict` melatih ulang SVR dan Random Forest dari awal.
4. URL API frontend (`http://localhost:8000`) di-*hardcode* di `App.jsx`, belum menggunakan variabel lingkungan (`.env`).
5. Prediksi berbasis data historis semata; tidak memperhitungkan faktor eksternal (berita, sentimen pasar, kebijakan) dan **bukan** alat pengambilan keputusan investasi yang berdiri sendiri.

---

## Roadmap

- [ ] Validasi silang berbasis waktu yang konsisten di seluruh pipeline
- [ ] Penyimpanan & pemuatan ulang model terlatih (*model persistence*)
- [ ] Prediksi multi-horizon (3, 7 hari, dst.)
- [ ] Konfigurasi API URL melalui environment variable (`VITE_API_BASE_URL`)
- [ ] Rapikan duplikasi `backend-bbri/` dan aktifkan struktur `pages/`/`context/` di frontend (atau hapus bila tidak dipakai)
- [ ] Endpoint *health-check* dan pengujian otomatis (CI)

---

## Penulis

**Sapar Hidayat**
Mahasiswa Teknik Informatika — Universitas Maritim Raja Ali Haji (UMRAH)

GitHub: [github.com/Shdyt13](https://github.com/Shdyt13)
LinkedIn: [linkedin.com/in/sapar-hidayat-s-200684301](https://www.linkedin.com/in/sapar-hidayat-s-200684301/)

---

Dibangun dengan Python, FastAPI, React, Scikit-learn, dan Docker.
