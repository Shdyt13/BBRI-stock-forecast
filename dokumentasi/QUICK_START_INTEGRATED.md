# 🚀 QUICK START - Sistem Terintegrasi dengan Backend Tim

**Status:** ✅ READY TO USE  
**Backend:** Team Version (@shdyt13)  
**Frontend:** V4.0 (React + Tailwind + Context API)

---

## ⚡ CARA MENJALANKAN (30 DETIK)

### 1️⃣ Start Docker Services

```bash
cd "c:\Users\HP\Documents\JASA WEBSITE\prediksi saham BBRI"
docker-compose up --build
```

**Tunggu hingga muncul:**

```
✅ backend  | INFO:     Uvicorn running on http://0.0.0.0:8000
✅ frontend | ➜  Local:   http://localhost:3000/
```

### 2️⃣ Buka Browser

Akses: **http://localhost:3000**

### 3️⃣ Upload & Run Prediction

1. **Upload File CSV** (contoh: `BBRI_2015_2025.csv`)
2. Klik tombol **"RUN PREDICTION"**
3. ⏳ Tunggu 10-30 detik (proses Machine Learning)
4. ✅ Dashboard menampilkan:
   - Grafik 3 garis (Actual + SVR + RF)
   - Tabel metrik MAE, RMSE, R²
   - Feature importance ranking

---

## 🎯 FITUR YANG TERSEDIA

### ✅ Dashboard

- Grafik 3 garis real-time
- Perbandingan SVR vs Random Forest
- Pemilihan skenario:
  - ⭕ Tanpa Feature Selection (All Features)
  - ⭕ Gunakan Feature Selection (Selected Features)

### ✅ Feature Selection Page

- Tabel ranking fitur dengan score
- Bar chart importance
- Badge status (Selected ✅ / Dropped ❌)

### ✅ Model Evaluation Page

- Tabel metrik lengkap
- Perbandingan model side-by-side
- Tab switching untuk 2 skenario

---

## 🛠️ TROUBLESHOOTING

### ❌ Port Sudah Digunakan

**Error:**

```
Error: bind: address already in use
```

**Solusi:**

```bash
# Stop semua container
docker-compose down

# Atau kill proses di port 8000/3000
netstat -ano | findstr :8000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### ❌ Backend Tidak Respon

**Cek logs:**

```bash
docker logs bbri-prediction-backend -f
```

**Jika error Python:**

```bash
# Rebuild container
docker-compose down
docker-compose up --build
```

### ❌ Frontend Error: "Failed to fetch"

**Penyebab:** Backend belum siap

**Solusi:**

1. Tunggu backend selesai booting (~5 detik)
2. Cek `http://localhost:8000/docs` (harus buka Swagger UI)
3. Refresh browser

### ⏱️ Loading Terlalu Lama (> 60 detik)

**Normal:** 10-30 detik (tergantung ukuran dataset)

**Jika terlalu lama:**

1. Cek ukuran file CSV (maksimal ~10MB / 3000 rows)
2. Cek Docker logs untuk error
3. Restart Docker Desktop

---

## 📁 STRUKTUR PROJECT

```
prediksi saham BBRI/
├── backend-bbri/          ← BACKEND TIM (AKTIF)
│   └── backend/
│       ├── main.py        ← API Endpoints
│       ├── ml_pipeline.py ← ML Functions
│       └── Dockerfile
│
├── frontend/              ← FRONTEND V4.0 (AKTIF)
│   └── src/
│       ├── context/
│       │   └── DataContext.jsx  ← 2-Step API + Data Mapping
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── FeatureSelection.jsx
│       │   └── ModelEvaluation.jsx
│       └── Dockerfile
│
├── docker-compose.yml     ← Container Orchestration
└── dokumentasi/
    └── TEAM_BACKEND_INTEGRATION_COMPLETE.md  ← Detail Teknis
```

---

## 🔗 API ENDPOINTS (Backend Tim)

### 1. Upload Dataset

```bash
POST http://localhost:8000/api/upload
Content-Type: multipart/form-data

Response:
{
  "message": "Dataset berhasil diunggah dan diproses!",
  "rows": 2710,
  "last_date": "2025-12-30"
}
```

### 2. Run Prediction

```bash
POST http://localhost:8000/api/predict
Content-Type: application/json

Response:
{
  "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
  "prediction": {...},
  "metrics": {...},
  "chart_data": {...}
}
```

### 3. API Documentation (Swagger)

```
http://localhost:8000/docs
```

---

## 📊 DATA FLOW

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend   │────▶│   Backend   │
│ localhost:  │     │   (React)    │     │  (FastAPI)  │
│    3000     │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                    │                     │
       │                    │                     │
       │              1. POST /upload             │
       │              2. POST /predict            │
       │                    │                     │
       │              3. mapTeamResponseToV4()    │
       │                    │                     │
       └────────────────────┴─────────────────────┘
              Display Chart + Metrics
```

---

## 🎓 UNTUK TIM DEVELOPER

### Cara Edit Kode (Live Reload)

**Backend:**

```bash
# Edit file di: backend-bbri/backend/main.py
# Docker akan auto-reload (volume binding aktif)
```

**Frontend:**

```bash
# Edit file di: frontend/src/
# Vite HMR akan auto-refresh browser
```

### Cara Stop Services

```bash
# Graceful shutdown
docker-compose down

# Force stop + remove volumes
docker-compose down -v
```

### Cara Rebuild Setelah Update

```bash
# Rebuild semua
docker-compose up --build

# Rebuild hanya backend
docker-compose up --build backend

# Rebuild hanya frontend
docker-compose up --build frontend
```

---

## 📞 KONTAK & REFERENSI

- **Backend Author:** @shdyt13 (GitHub)
- **Frontend/Integration:** KIRO AI Agent
- **Dokumentasi Lengkap:** `dokumentasi/TEAM_BACKEND_INTEGRATION_COMPLETE.md`
- **API Docs:** `backend-bbri/backend/README.md`

---

## ✅ CHECKLIST TESTING

Sebelum deploy atau presentasi:

- [ ] Docker services running (backend + frontend)
- [ ] Browser bisa akses `http://localhost:3000`
- [ ] Swagger UI bisa akses `http://localhost:8000/docs`
- [ ] Upload CSV berhasil (cek Console log)
- [ ] Prediction berhasil (loading 10-30 detik)
- [ ] Dashboard chart muncul (3 garis)
- [ ] Feature Selection page tampil
- [ ] Model Evaluation page tampil
- [ ] Tab switching berfungsi
- [ ] Data persisten saat ganti halaman

---

**SISTEM SIAP DIGUNAKAN!** 🎉

Jika ada pertanyaan atau error, cek file `TEAM_BACKEND_INTEGRATION_COMPLETE.md` untuk detail teknis lengkap.
