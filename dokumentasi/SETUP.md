# Setup & Installation Guide

## Prerequisites

Pastikan Anda telah menginstall:
- **Node.js** versi 16 atau lebih tinggi
- **npm** atau **yarn**
- **Python** versi 3.9 atau lebih tinggi
- **pip** (Python package manager)

## Langkah-Langkah Setup

### 1. Clone atau Download Project

```bash
# Jika menggunakan Git
git clone <repository-url>
cd prediksi-saham-bbri

# Atau extract ZIP file yang telah didownload
```

### 2. Setup Frontend

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Atau jika menggunakan yarn
yarn install
```

**Catatan untuk Windows**: Jika Anda mengalami error terkait Node.js version (seperti `EBADENGINE`), Anda memiliki beberapa opsi:
- Update Node.js ke versi terbaru (recommended)
- Atau gunakan flag `--legacy-peer-deps`: `npm install --legacy-peer-deps`

### 3. Setup Backend

```bash
# Masuk ke direktori backend
cd ../backend

# Buat virtual environment
python -m venv venv

# Aktivasi virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables template
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac
```

### 4. Jalankan Development Server

#### Terminal 1 - Frontend

```bash
cd frontend
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

#### Terminal 2 - Backend

```bash
cd backend
# Pastikan virtual environment sudah aktif
python main.py
```

Backend API akan berjalan di: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

## Verifikasi Installation

### Cek Frontend
1. Buka browser dan akses `http://localhost:3000`
2. Anda akan melihat halaman Dashboard dengan logo BRI
3. Sidebar menu harus berfungsi untuk navigasi antar halaman

### Cek Backend
1. Buka browser dan akses `http://localhost:8000`
2. Anda akan melihat JSON response:
```json
{
  "message": "BBRI Stock Prediction API",
  "status": "running",
  "version": "1.0.0"
}
```
3. Akses dokumentasi API di `http://localhost:8000/docs`

## Troubleshooting

### Frontend Issues

**Problem**: `npm install` gagal dengan error `EBADENGINE`
```bash
# Solution 1: Update Node.js
# Download dan install dari https://nodejs.org/

# Solution 2: Bypass engine check
npm install --legacy-peer-deps
```

**Problem**: Port 3000 sudah digunakan
```bash
# Edit vite.config.js dan ubah port
server: {
  port: 3001,  // Ganti dengan port lain
  open: true
}
```

### Backend Issues

**Problem**: `python` command tidak ditemukan
```bash
# Gunakan python3 di Linux/Mac
python3 -m venv venv
python3 main.py

# Di Windows, pastikan Python sudah ada di PATH
```

**Problem**: Port 8000 sudah digunakan
```bash
# Edit main.py, bagian paling bawah
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
    # Ganti port ke 8001 atau port lain yang tersedia
```

**Problem**: ModuleNotFoundError
```bash
# Pastikan virtual environment aktif (Anda akan melihat (venv) di command prompt)
# Lalu install ulang dependencies
pip install -r requirements.txt
```

## Struktur File Penting

```
prediksi-saham-bbri/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigasi sidebar
│   │   │   ├── Layout.jsx        # Layout wrapper
│   │   │   └── FileUpload.jsx    # Komponen upload file
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Halaman dashboard
│   │   │   ├── SVRPrediction.jsx        # Halaman SVR
│   │   │   ├── RFPrediction.jsx         # Halaman RF
│   │   │   ├── FeatureSelection.jsx     # Halaman feature selection
│   │   │   └── ModelEvaluation.jsx      # Halaman evaluasi
│   │   ├── App.jsx               # Root component + routing
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── .env.example             # Environment variables template
│
├── README.md                     # Dokumentasi utama
└── SETUP.md                      # File ini
```

## Next Steps

Setelah setup berhasil:

1. **Eksplorasi UI**: Navigasi melalui semua halaman untuk memahami flow aplikasi
2. **Test API**: Gunakan Swagger UI di `/docs` untuk test API endpoints
3. **Custom Data**: Siapkan file CSV untuk data saham BBRI
4. **Implementation**: Mulai implementasi algoritma ML di backend
5. **Integration**: Hubungkan frontend dengan backend API

## Tips Development

- **Hot Reload**: Vite (frontend) dan Uvicorn (backend) support hot reload
- **Browser DevTools**: Gunakan untuk debug React components
- **API Documentation**: Selalu cek `/docs` untuk API contract
- **Tailwind IntelliSense**: Install extension untuk autocomplete Tailwind classes

## Bantuan Lebih Lanjut

Jika mengalami masalah yang tidak tercantum di sini:
1. Cek terminal output untuk error messages
2. Pastikan semua dependencies terinstall dengan benar
3. Verifikasi versi Node.js dan Python yang digunakan
4. Cek apakah port yang digunakan tidak bentrok dengan aplikasi lain

---

**Happy Coding! 🚀**
