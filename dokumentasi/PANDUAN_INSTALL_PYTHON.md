# 🐍 Panduan Lengkap Install Python untuk Backend

**Tujuan:** Menginstall Python agar backend Machine Learning bisa berjalan

**Estimasi Waktu:** 10-15 menit

---

## 📋 **METODE 1: INSTALL DARI PYTHON.ORG** (Recommended)

### **Langkah 1: Download Python**

1. Buka browser
2. Kunjungi: **https://www.python.org/downloads/**
3. Klik tombol kuning besar **"Download Python 3.12.x"** (atau versi terbaru)
4. File installer akan terdownload (sekitar 25-30 MB)

**Screenshot yang Anda lihat:**
```
┌────────────────────────────────────────┐
│  Download Python 3.12.4 for Windows    │  ← Klik ini
└────────────────────────────────────────┘
```

---

### **Langkah 2: Jalankan Installer**

1. Buka file yang sudah didownload (misal: `python-3.12.4-amd64.exe`)
2. **⚠️ SANGAT PENTING:** Di layar pertama installer:
   
   ```
   ┌─────────────────────────────────────────────────┐
   │  Install Python 3.12.4                          │
   │                                                 │
   │  ☐ Install launcher for all users              │
   │  ☑ Add python.exe to PATH  ← CENTANG INI!      │
   │                                                 │
   │  [ Install Now ]  [ Customize installation ]   │
   └─────────────────────────────────────────────────┘
   ```

3. **CENTANG** kotak **"Add python.exe to PATH"**
4. Klik **"Install Now"**
5. Tunggu proses instalasi selesai (3-5 menit)
6. Klik **"Close"** setelah muncul "Setup was successful"

---

### **Langkah 3: Verifikasi Instalasi**

1. Buka **Command Prompt** (tekan `Win + R`, ketik `cmd`, Enter)
2. Ketik perintah ini dan tekan Enter:

```bash
python --version
```

**Hasil yang diharapkan:**
```
Python 3.12.4
```

3. Test pip (package manager):

```bash
pip --version
```

**Hasil yang diharapkan:**
```
pip 24.0 from C:\Users\HP\AppData\Local\Programs\Python\Python312\lib\site-packages\pip (python 3.12)
```

✅ **Jika kedua perintah berhasil, Python sudah terinstall dengan benar!**

---

## 📋 **METODE 2: INSTALL DARI MICROSOFT STORE** (Alternatif)

### **Langkah 1: Buka Microsoft Store**

1. Tekan `Win + S` (Search)
2. Ketik: **Microsoft Store**
3. Klik aplikasi Microsoft Store

---

### **Langkah 2: Search & Install Python**

1. Di dalam Microsoft Store, klik search bar
2. Ketik: **Python 3.12** atau **Python 3.11**
3. Pilih **Python 3.12** dari hasil pencarian
4. Klik tombol **"Get"** atau **"Install"**
5. Tunggu download dan instalasi selesai (5-10 menit)

---

### **Langkah 3: Verifikasi**

1. Buka **Command Prompt baru** (penting: buka yang baru!)
2. Test:

```bash
python --version
pip --version
```

✅ **Jika berhasil, lanjut ke langkah berikutnya!**

---

## 🔧 **LANGKAH 4: INSTALL DEPENDENCIES BACKEND**

Setelah Python terinstall, Anda perlu install library yang dibutuhkan backend:

### **1. Buka Command Prompt**

### **2. Navigasi ke folder backend:**

```bash
cd "C:\Users\HP\Documents\JASA WEBSITE\prediksi saham BBRI\backend"
```

### **3. Install semua dependencies:**

```bash
pip install -r requirements.txt
```

**Proses ini akan menginstall:**
- ✅ FastAPI (web framework)
- ✅ Uvicorn (server)
- ✅ Pandas (data processing)
- ✅ NumPy (numerical computing)
- ✅ scikit-learn (machine learning)
- ✅ python-multipart (file upload)

**Tunggu hingga selesai (3-5 menit)**

**Hasil akhir yang diharapkan:**
```
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 pandas-2.1.3 numpy-1.26.2 scikit-learn-1.3.2 ...
```

---

## 🚀 **LANGKAH 5: JALANKAN BACKEND**

### **1. Masih di folder backend, jalankan:**

```bash
python main.py
```

### **2. Anda akan melihat output seperti ini:**

```
🚀 Starting BBRI Stock Prediction API Server...
📖 API Documentation: http://localhost:8000/docs
🔍 Interactive API: http://localhost:8000/redoc
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ **BACKEND BERHASIL BERJALAN!**

---

## 🧪 **LANGKAH 6: TEST BACKEND**

### **Test 1: Buka Browser**

Buka di browser:
```
http://localhost:8000
```

**Anda akan melihat JSON response:**
```json
{
  "message": "BBRI Stock Prediction API",
  "status": "running",
  "version": "2.0.0"
}
```

### **Test 2: Buka API Documentation**

```
http://localhost:8000/docs
```

**Anda akan melihat Swagger UI** dengan semua endpoint API!

---

## 🎯 **LANGKAH 7: TEST DENGAN SAMPLE DATA**

### **Cara 1: Via Swagger UI**

1. Buka: http://localhost:8000/docs
2. Cari endpoint **POST /api/evaluate-models**
3. Klik untuk expand
4. Klik tombol **"Try it out"**
5. Klik **"Choose File"**
6. Pilih file: `backend/sample_data.csv`
7. Klik **"Execute"**
8. Scroll ke bawah untuk lihat **Response**

**Response yang diharapkan:**
```json
{
  "status": "success",
  "message": "Model training dan evaluasi berhasil",
  "metrics": {
    "svr": {"mae": 12450.23, "rmse": 15320.45, "r2": 0.9876},
    "random_forest": {"mae": 13200.56, "rmse": 16100.78, "r2": 0.9845}
  },
  "chart_data": [...]
}
```

✅ **MACHINE LEARNING BERJALAN!**

### **Cara 2: Via Command Line**

Buka Command Prompt baru (jangan close yang backend):

```bash
cd "C:\Users\HP\Documents\JASA WEBSITE\prediksi saham BBRI\backend"
curl -X POST "http://localhost:8000/api/evaluate-models" -F "file=@sample_data.csv"
```

---

## 📊 **LANGKAH 8: SISTEM LENGKAP BERJALAN**

Sekarang Anda punya **2 terminal/Command Prompt** terbuka:

### **Terminal 1: Frontend**
```bash
cd frontend
npm run dev
```
**URL:** http://localhost:3000/

### **Terminal 2: Backend**
```bash
cd backend
python main.py
```
**URL:** http://localhost:8000/

**KEDUA SISTEM SEKARANG BERJALAN! 🎉**

---

## 🔍 **TROUBLESHOOTING**

### **Problem 1: "python is not recognized"**

**Penyebab:** Python belum ada di PATH

**Solusi:**
1. Uninstall Python (Control Panel → Programs)
2. Install ulang
3. ⚠️ **JANGAN LUPA CENTANG "Add Python to PATH"**
4. Restart Command Prompt

---

### **Problem 2: "pip: command not found"**

**Solusi:**
```bash
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

---

### **Problem 3: Error saat install dependencies**

**Solusi:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

---

### **Problem 4: Port 8000 already in use**

**Penyebab:** Port sudah dipakai program lain

**Solusi:**
```bash
# Cari program yang pakai port 8000
netstat -ano | findstr :8000

# Matikan program tersebut atau ubah port di main.py
# Buka main.py, cari baris terakhir, ubah port=8000 jadi port=8001
```

---

### **Problem 5: ModuleNotFoundError**

**Contoh:** `ModuleNotFoundError: No module named 'fastapi'`

**Solusi:**
```bash
cd backend
pip install -r requirements.txt
```

---

## ✅ **CHECKLIST FINAL**

Pastikan semua ini sudah berhasil:

- [ ] Python terinstall (`python --version` berjalan)
- [ ] pip terinstall (`pip --version` berjalan)
- [ ] Dependencies terinstall (tidak ada error saat `pip install -r requirements.txt`)
- [ ] Backend berjalan (`python main.py` tanpa error)
- [ ] API response (`http://localhost:8000` menampilkan JSON)
- [ ] Swagger UI terbuka (`http://localhost:8000/docs` berjalan)
- [ ] Test dengan sample data berhasil (response JSON lengkap)
- [ ] Frontend masih berjalan (`http://localhost:3000`)

**Jika semua ✅, sistem Anda SIAP 100%!**

---

## 🎯 **NEXT STEPS SETELAH PYTHON TERINSTALL**

1. ✅ Jalankan backend: `python main.py`
2. 🌐 Test API: http://localhost:8000/docs
3. 📊 Upload sample_data.csv via Swagger UI
4. 🎨 Buka frontend: http://localhost:3000
5. 🔗 Integrasikan frontend dengan backend (nanti)

---

## 📞 **BUTUH BANTUAN?**

Jika ada error atau masalah:

1. **Copy error message** yang muncul
2. Beritahu saya error tersebut
3. Saya akan bantu troubleshoot

**Common errors:**
- "Python is not recognized" → Restart Command Prompt
- "Permission denied" → Jalankan Command Prompt as Administrator
- "Module not found" → Jalankan `pip install -r requirements.txt` lagi

---

## 🎉 **SELAMAT!**

Setelah mengikuti panduan ini, sistem Anda akan **100% LENGKAP**:

- ✅ Frontend (React + Vite)
- ✅ Backend (FastAPI + Python)
- ✅ Machine Learning (SVR + Random Forest)
- ✅ API Documentation (Swagger UI)
- ✅ Sample Data (Testing)

**READY FOR PRODUCTION! 🚀**

---

*Panduan dibuat: 29 Juli 2026*  
*Untuk: Sistem Prediksi Saham BBRI*  
*Tingkat Kesulitan: ⭐⭐☆☆☆ (Mudah)*
