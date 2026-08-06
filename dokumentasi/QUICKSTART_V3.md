# ⚡ QUICK START GUIDE - V3.0

## 🚀 Menjalankan Sistem (3 Langkah)

### Metode 1: Docker (RECOMMENDED)

```bash
# 1. Build & Start
docker-compose up --build

# 2. Wait for logs:
#    ✓ Backend: "Application startup complete"
#    ✓ Frontend: "ready in xxx ms"

# 3. Open browser:
#    http://localhost:3000
```

**Selesai! Sistem siap digunakan.** 🎉

---

### Metode 2: Manual

**Terminal 1 - Backend:**

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Browser:**

```
http://localhost:5173
```

---

## 📖 Cara Menggunakan Sistem

### Step 1: Upload Dataset

1. Buka **Dashboard**
2. Drag & drop file CSV atau klik "Browse File"
3. File harus memiliki kolom: `Date, Open, High, Low, Close, Volume`

### Step 2: Pilih Model & Opsi

1. Pilih model: **SVR** atau **Random Forest**
2. (Optional) Centang **"Gunakan Feature Selection"**

### Step 3: Run Prediction

1. Klik tombol **"RUN PREDICTION"**
2. Tunggu ±10-30 detik (GridSearchCV sedang berjalan)
3. Hasil akan muncul di Dashboard

### Step 4: Lihat Analisis

1. **Dashboard**: Chart prediksi + nilai terakhir
2. **Feature Selection**: Ranking fitur + bar chart
3. **Model Evaluation**: Tabel metrik + comparison chart

---

## 🎯 Fitur Baru V3.0

✅ **Advanced ML Pipeline**

- Log Return transformation
- GridSearchCV hyperparameter tuning
- Dual-scenario experiment (All vs Selected Features)

✅ **Modern Dashboard**

- 5-card layout
- Interactive model selection
- Real-time chart visualization

✅ **Automated Feature Selection**

- Random Forest importance calculation
- Auto-ranking & threshold
- Visual bar chart

✅ **Comprehensive Evaluation**

- Side-by-side metrics comparison
- Best model determination
- Metric explanations

---

## 🐛 Troubleshooting

**Backend tidak start?**

```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
cd backend
python -m pip install -r requirements.txt --force-reinstall
```

**Frontend tidak start?**

```bash
# Check Node.js version
node --version  # Should be 16.0+

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error saat upload CSV?**

- Pastikan file memiliki kolom: `Date, Open, High, Low, Close, Volume`
- Pastikan tidak ada baris kosong
- Coba dengan `backend/sample_data.csv` untuk testing

---

## 📚 Dokumentasi Lengkap

- **REFACTORING_V3_SUMMARY.md** - Technical details
- **PANDUAN_PENGGUNAAN.md** - User manual
- **DOCKER_GUIDE.md** - Docker documentation

---

**Happy Predicting! 🚀📈**
