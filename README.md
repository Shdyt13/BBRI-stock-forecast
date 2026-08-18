# 📈 Sistem Prediksi Saham BBRI

Aplikasi web machine learning untuk prediksi harga saham Bank BRI menggunakan Support Vector Regression (SVR) dan Random Forest Regressor dengan feature selection otomatis.

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- Port 3000 (Frontend) dan 8000 (Backend) tersedia

### Menjalankan Aplikasi

```bash
# Clone repository (jika dari Git)
git clone <repository-url>
cd "prediksi saham BBRI"

# Jalankan dengan Docker Compose
docker-compose up --build
```

**Aplikasi akan berjalan di:**

- 🌐 **Frontend**: http://localhost:3000
- ⚙️ **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

---

## ✨ Fitur Utama

### 1. **Dashboard - Prediksi Saham**

- 📤 **Upload CSV Dataset** dengan drag & drop atau file browser
- 📊 **Instant Metadata Parsing** - info dataset muncul langsung setelah upload
- 🎯 **Dual Scenario**: Prediksi dengan/tanpa feature selection
- 📈 **Grafik Interaktif** - perbandingan 3 garis (Aktual, SVR, Random Forest)
- 📉 **Metrik Real-time** - MAE, RMSE, R² Score untuk setiap model

### 2. **Feature Selection**

- 🔍 **Ranking Feature Importance** berdasarkan score
- 📊 **Visualisasi Bar Chart** horizontal untuk perbandingan fitur
- ✅ **Status Selection** - fitur dipilih vs diabaikan
- 📋 **Tabel Lengkap** dengan progress bar visual

### 3. **Model Evaluation**

- 🏆 **Best Model Detection** - otomatis deteksi model terbaik
- 📊 **Perbandingan Side-by-Side** SVR vs Random Forest
- 🎚️ **Scenario Switcher** - toggle antara dengan/tanpa feature selection
- 📈 **Visual Progress Bars** untuk setiap metrik

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  - Vite + React 18                                      │
│  - Tailwind CSS                                         │
│  - Recharts (Visualisasi)                              │
│  - React Router (Navigasi)                             │
│  Port: 3000                                             │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API
                  │ (JSON)
┌─────────────────▼───────────────────────────────────────┐
│                    BACKEND (FastAPI)                    │
│  - Python 3.11                                          │
│  - FastAPI Framework                                    │
│  - Pandas (Data Processing)                            │
│  - Scikit-learn (ML Models)                            │
│  Port: 8000                                             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ CSV Upload
┌─────────────────▼───────────────────────────────────────┐
│                   ML PIPELINE                           │
│  1. Data Preprocessing                                  │
│  2. Feature Engineering (Log Returns)                  │
│  3. Train/Test Split (80/20)                           │
│  4. Feature Selection (Random Forest)                  │
│  5. Model Training (SVR + Random Forest)               │
│  6. Evaluation (MAE, RMSE, R²)                         │
│  7. Prediction (Next Trading Day)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Struktur Proyek

```
prediksi saham BBRI/
├── frontend/                      # Frontend React App
│   ├── src/
│   │   ├── components/           # Komponen UI (Sidebar, Layout)
│   │   ├── context/              # React Context (DataContext)
│   │   ├── pages/                # Halaman (Dashboard, Feature Selection, Model Evaluation)
│   │   ├── App.jsx               # Root component
│   │   └── index.css             # Global styles
│   ├── Dockerfile                # Frontend container config
│   └── package.json              # Dependencies
│
├── backend-bbri/                  # Backend FastAPI
│   └── backend/
│       ├── data/                 # Temporary CSV storage
│       ├── main.py               # FastAPI endpoints
│       ├── ml_pipeline.py        # ML logic & functions
│       ├── Dockerfile            # Backend container config
│       └── requirements.txt      # Python dependencies
│
├── docker-compose.yml             # Orchestration config
└── README.md                      # Documentation (this file)
```

---

## 🔌 API Endpoints

### 1. **Upload Dataset**

```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (CSV)

Response:
{
  "message": "Dataset berhasil diunggah dan diproses!",
  "rows": 2500,
  "last_date": "2025-12-30"
}
```

### 2. **Run Prediction**

```http
POST /api/predict

Response:
{
  "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
  "dataset_info": {
    "total_rows": 2500,
    "start_date": "2015-01-05",
    "end_date": "2025-12-30"
  },
  "prediction": {
    "base_date": "2025-12-30",
    "prediction_date": "2026-01-02",
    "last_actual_close": 3660.00,
    "Selected_Features": {
      "SVR": 3720.50,
      "RandomForest": 3695.25
    },
    "All_Features": {
      "SVR": 3710.00,
      "RandomForest": 3685.75
    }
  },
  "feature_selection": {
    "selected_features": ["Open", "High", "Low", "Volume"],
    "ranking": [...]
  },
  "metrics": {
    "All_Features": {
      "SVR": {"MAE": 0.0123, "RMSE": 0.0156, "R2": 0.8945},
      "RandomForest": {"MAE": 0.0145, "RMSE": 0.0178, "R2": 0.8723}
    },
    "Selected_Features": {
      "SVR": {"MAE": 0.0134, "RMSE": 0.0167, "R2": 0.8812},
      "RandomForest": {"MAE": 0.0156, "RMSE": 0.0189, "R2": 0.8590}
    }
  },
  "chart_data": {
    "dates": ["2024-01-02", "2024-01-03", ...],
    "actual": [3500.00, 3520.00, ...],
    "svr_selected": [3505.50, 3518.25, ...],
    "rf_selected": [3502.75, 3515.50, ...],
    "svr_all": [3508.00, 3521.00, ...],
    "rf_all": [3499.25, 3512.75, ...]
  }
}
```

---

## 📊 Format Dataset CSV

### Required Columns:

- `Date`: Tanggal trading (format: YYYY-MM-DD)
- `Open`: Harga pembukaan
- `High`: Harga tertinggi
- `Low`: Harga terendah
- `Close`: Harga penutupan (target prediksi)
- `Volume`: Volume trading

### Contoh CSV:

```csv
Date,Open,High,Low,Close,Volume
2015-01-05,3450.00,3480.00,3440.00,3470.00,125000000
2015-01-06,3475.00,3490.00,3465.00,3485.00,130000000
...
```

### Data Requirements:

- Minimum 100 baris untuk training yang baik
- Data harus berurutan berdasarkan tanggal
- Tidak ada missing values (NaN)
- Numeric values untuk semua kolom kecuali Date

---

## 🧠 Machine Learning Pipeline

### 1. **Data Preprocessing**

```python
# Feature Engineering
df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
df['Target_Log_Return'] = df['Log_Return'].shift(-1)

# Features
FEATURES = ['Open', 'High', 'Low', 'Close', 'Volume', 'Log_Return']
```

### 2. **Train/Test Split**

- **Training**: 80% data pertama (chronological)
- **Testing**: 20% data terakhir
- **Time Series Split**: Tidak menggunakan random split

### 3. **Feature Selection**

```python
# Random Forest Feature Importance
selector = RandomForestRegressor(n_estimators=50, random_state=42)
selector.fit(X_train, y_train)
importances = selector.feature_importances_

# Select top-k features
selected_features = top_k_features  # Default: top 4
```

### 4. **Model Training**

#### Support Vector Regression (SVR)

```python
param_grid = {
    'C': [10, 100],
    'epsilon': [0.01, 0.1]
}
GridSearchCV(SVR(kernel='rbf'), param_grid, cv=3, n_jobs=-1)
```

#### Random Forest Regressor

```python
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [10, 20]
}
GridSearchCV(RandomForestRegressor(), param_grid, cv=3, n_jobs=-1)
```

### 5. **Evaluation Metrics**

- **MAE (Mean Absolute Error)**: Rata-rata kesalahan absolut
- **RMSE (Root Mean Squared Error)**: Akar kuadrat rata-rata error
- **R² Score**: Koefisien determinasi (0-1, semakin tinggi semakin baik)

---

## 🎨 Teknologi Stack

### Frontend

- ⚛️ **React 18** - UI Library
- ⚡ **Vite** - Build Tool
- 🎨 **Tailwind CSS** - Styling
- 📊 **Recharts** - Chart Library
- 🛣️ **React Router** - Routing
- 🎯 **Lucide Icons** - Icon Library

### Backend

- 🚀 **FastAPI** - Web Framework
- 🐼 **Pandas** - Data Processing
- 🤖 **Scikit-learn** - Machine Learning
- 📈 **NumPy** - Numerical Computing
- 🔧 **Uvicorn** - ASGI Server

### DevOps

- 🐳 **Docker** - Containerization
- 📦 **Docker Compose** - Orchestration

---

## 🛠️ Development Mode

### Frontend Development

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend Development

```bash
cd backend-bbri/backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

---

## 🔧 Konfigurasi

### Frontend Environment Variables

```javascript
// src/context/DataContext.jsx
const API_BASE_URL = "http://localhost:8000";
```

### Backend Configuration

```python
# main.py - CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: specify exact origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Docker Ports

```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "3000:3000"
  backend:
    ports:
      - "8000:8000"
```

---

## 📈 Performance Optimization

### Backend ML Pipeline

- **GridSearchCV**: Reduced parameter combinations (2-4 total)
- **CV Folds**: 3 (balanced antara akurasi dan kecepatan)
- **Multi-core Processing**: `n_jobs=-1` (gunakan semua CPU cores)
- **Feature Selection**: Limit 50 trees untuk speed
- **Target Processing Time**: < 10 detik per prediksi

### Frontend Performance

- **Instant CSV Parsing**: < 1 detik untuk file 2-3MB
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React Context caching
- **Responsive Charts**: Recharts dengan ResponsiveContainer
- **Defensive Programming**: Prevent white screen errors

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop existing containers
docker-compose down

# Check ports
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F
```

### Container Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### CSV Upload Error

- ✅ Pastikan CSV format benar (comma-separated)
- ✅ Cek kolom wajib: Date, Open, High, Low, Close, Volume
- ✅ Pastikan tidak ada missing values
- ✅ File size < 10MB

### Prediction Takes Too Long

- ⚡ Backend optimized untuk < 10 detik
- ⚡ Jika lebih lama, cek CPU usage
- ⚡ Reduce dataset size jika perlu

---

## 📝 Changelog

### Version 4.0 (Current)

- ✅ Full integration dengan backend tim (@shdyt13)
- ✅ Instant CSV metadata parsing (frontend)
- ✅ Dual scenario: dengan/tanpa feature selection
- ✅ Defensive programming (no white screen)
- ✅ Compact responsive layout
- ✅ Complete scrollbar fix
- ✅ Feature Selection page dengan ranking
- ✅ Model Evaluation dengan perbandingan metrik
- ✅ Grafik 3 garis (Actual, SVR, RF)
- ✅ Best model detection otomatis

### Previous Versions

- v3.0: Frontend-only with mock data
- v2.0: Basic dashboard with single model
- v1.0: Initial prototype

---

## 👥 Tim Pengembang

- **Frontend V4.0**: Refactoring & Integration
- **Backend ML**: @shdyt13 (Team Repository)
- **ML Pipeline**: Support Vector Regression + Random Forest
- **DevOps**: Docker containerization & orchestration

---

## 📄 License

Proprietary - For educational and research purposes only.

---

## 🆘 Support

Untuk pertanyaan atau issue:

1. Check troubleshooting section di atas
2. Baca dokumentasi API di http://localhost:8000/docs
3. Check browser console untuk error messages
4. Verify Docker containers running: `docker ps`

---

## 🎯 Roadmap

### Planned Features

- [ ] Historical comparison (multiple dates)
- [ ] Export predictions to CSV
- [ ] Advanced feature engineering
- [ ] Model persistence (save/load)
- [ ] User authentication
- [ ] Real-time data feed integration
- [ ] Mobile responsive improvements
- [ ] Dark mode toggle

---

**🚀 Happy Predicting! 📈**

_Last Updated: August 7, 2026_
