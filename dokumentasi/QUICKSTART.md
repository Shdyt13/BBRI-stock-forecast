# ⚡ Quick Start Guide

Panduan cepat untuk memulai proyek Sistem Prediksi Saham BBRI.

## 🚀 Cara Tercepat (Windows)

### Instalasi Otomatis

1. **Double-click** file `INSTALL_DEPENDENCIES.bat`
2. Tunggu hingga instalasi selesai (5-10 menit)
3. **Double-click** file `START_DEV.bat`
4. Dua terminal akan terbuka otomatis
5. Buka browser di `http://localhost:3000`

**Selesai!** ✅

---

## 📋 Manual Installation (Semua Platform)

### Step 1: Install Frontend

```bash
cd frontend
npm install
```

### Step 2: Install Backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Run Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
python main.py
```

### Step 4: Open Browser

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎯 Fitur yang Sudah Tersedia

### ✅ Frontend (100% Complete)
- [x] Dashboard dengan upload section
- [x] SVR Prediction dengan chart interaktif
- [x] RF Prediction dengan chart interaktif
- [x] Feature Selection dengan table & bar chart
- [x] Model Evaluation dengan comparison charts
- [x] Responsive sidebar navigation
- [x] Pixel-perfect design sesuai mockup

### ⚠️ Backend (API Skeleton)
- [x] FastAPI server setup
- [x] API endpoints structure
- [x] CORS configuration
- [ ] ML algorithm implementation (TODO)
- [ ] Data processing (TODO)
- [ ] Model training & prediction (TODO)

---

## 🧪 Test Aplikasi

### Test Frontend:
1. ✅ Klik menu "Dashboard" - harus tampil upload section
2. ✅ Klik menu "SVR Prediction" - klik tombol "Run SVR Prediction" untuk melihat chart
3. ✅ Klik menu "RF Prediction" - klik tombol "Run FR Prediction" untuk melihat chart
4. ✅ Klik menu "Feature Selection" - harus tampil table dan bar chart
5. ✅ Klik menu "Model Evaluation" - harus tampil comparison charts

### Test Backend:
1. Buka http://localhost:8000 - harus muncul JSON response
2. Buka http://localhost:8000/docs - harus muncul Swagger UI
3. Test endpoint "GET /" di Swagger UI
4. Test endpoint "GET /api/model-evaluation"

---

## 📱 Preview Halaman

### Dashboard
- Upload data training dan testing
- Display date ranges
- Show data summary (jumlah baris)

### SVR / RF Prediction
- Upload section (sama seperti Dashboard)
- Tombol "Run Prediction"
- Area chart dengan data historis dan forecasting

### Feature Selection
- 3 info cards (Total, Selected, Method)
- Table dengan ranking features
- Horizontal bar chart untuk importance scores

### Model Evaluation
- Model metrics cards (SVR vs RF)
- Grouped bar chart comparison
- Summary hasil dengan icons
- Multi-line chart untuk perbandingan prediksi

---

## 🛠️ Troubleshooting Cepat

### ❌ Frontend tidak jalan
```bash
cd frontend
rm -rf node_modules package-lock.json  # Linux/Mac
# atau: rmdir /s node_modules & del package-lock.json  # Windows
npm install --legacy-peer-deps
npm run dev
```

### ❌ Backend error "python not found"
```bash
# Ganti 'python' dengan 'python3' atau 'py'
python3 -m venv venv  # Coba ini
# atau
py -m venv venv       # Atau ini
```

### ❌ Port sudah digunakan
**Frontend (port 3000):**
- Edit `frontend/vite.config.js`
- Ubah `port: 3000` menjadi `port: 3001`

**Backend (port 8000):**
- Edit `backend/main.py` (line terakhir)
- Ubah `port=8000` menjadi `port=8001`

---

## 🎨 Design Reference

Aplikasi ini dibangun berdasarkan 5 gambar referensi:
1. ✅ Dashboard.png - Implemented
2. ✅ SVR Prediction.png - Implemented
3. ✅ RF Prediction.png - Implemented
4. ✅ Feature Selection.png - Implemented
5. ✅ Model Evaluation.png - Implemented

Semua halaman sudah di-implementasi dengan **pixel-perfect accuracy** menggunakan:
- React.js (Functional Components + Hooks)
- Tailwind CSS (Utility-first styling)
- Recharts (Data visualization)
- Lucide React (Icon library)
- React Router (Client-side routing)

---

## 📚 Dokumentasi Lengkap

- **README.md** - Overview proyek
- **SETUP.md** - Panduan instalasi detail
- **DESIGN_DOCUMENTATION.md** - Spesifikasi desain lengkap
- **QUICKSTART.md** - File ini (panduan cepat)

---

## 🔥 Next Steps

Setelah aplikasi berjalan:

1. **Explore UI** - Navigasi semua halaman
2. **Check API** - Test endpoints di `/docs`
3. **Prepare Data** - Siapkan CSV data saham BBRI
4. **Implement ML** - Coding algoritma SVR & Random Forest
5. **Connect API** - Integrate frontend dengan backend
6. **Deploy** - Setup Docker & deploy

---

## 💡 Tips

- **Hot Reload**: Edit code dan lihat perubahan langsung
- **React DevTools**: Install extension untuk debug React
- **Tailwind IntelliSense**: Install extension untuk autocomplete
- **API Testing**: Gunakan Swagger UI di `/docs` atau Postman

---

## 🆘 Butuh Bantuan?

Jika ada masalah:
1. Baca error message di terminal dengan teliti
2. Cek dokumentasi di `SETUP.md` dan `DESIGN_DOCUMENTATION.md`
3. Pastikan semua prerequisites terinstall (Node.js, Python)
4. Cek port tidak bentrok dengan aplikasi lain

---

**Happy Coding! 🚀**

Dibuat dengan ❤️ oleh KIRO AI - Expert Full-Stack Developer
