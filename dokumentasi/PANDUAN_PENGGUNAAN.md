# 📘 PANDUAN PENGGUNAAN SISTEM

## Sistem Prediksi Saham BBRI Menggunakan Support Vector Regression (SVR) dan Random Forest

---

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Prasyarat Sistem](#prasyarat-sistem)
4. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
5. [Ketentuan Format Data CSV](#ketentuan-format-data-csv)
6. [Panduan Penggunaan Fitur](#panduan-penggunaan-fitur)
7. [Troubleshooting](#troubleshooting)
8. [FAQ (Pertanyaan yang Sering Diajukan)](#faq)

---

## 📖 Pendahuluan

**Sistem Prediksi Saham BBRI** adalah aplikasi web berbasis _Machine Learning_ yang dirancang untuk memprediksi harga saham Bank Rakyat Indonesia (BBRI) menggunakan dua algoritma regresi, yaitu:

- **Support Vector Regression (SVR)** - Algoritma berbasis kernel untuk prediksi non-linear
- **Random Forest Regressor (RF)** - Algoritma ensemble learning berbasis decision tree

### Tujuan Sistem

Sistem ini bertujuan untuk:
✅ Membantu analisis tren harga saham BBRI  
✅ Membandingkan performa dua algoritma Machine Learning  
✅ Memberikan visualisasi prediksi yang mudah dipahami  
✅ Mengidentifikasi fitur (variabel) yang paling berpengaruh terhadap harga saham

### Pengguna Target

- Mahasiswa dan peneliti yang melakukan studi tentang prediksi saham
- Dosen penguji dan pembimbing skripsi
- Praktisi yang ingin memahami performa model ML untuk time series

---

## 🏗️ Arsitektur Sistem

Sistem ini dibangun dengan arsitektur **Full-Stack Modern** yang terdiri dari:

### Frontend (Antarmuka Pengguna)

- **Framework:** React.js dengan Vite
- **State Management:** Context API untuk data global
- **Styling:** Tailwind CSS
- **Visualisasi:** Recharts untuk grafik dan chart
- **Routing:** React Router DOM untuk navigasi antar halaman

### Backend (API & Machine Learning)

- **Framework:** FastAPI (Python)
- **Machine Learning:** scikit-learn
- **Data Processing:** Pandas, NumPy
- **Preprocessing:** MinMaxScaler untuk normalisasi data
- **Model Training:** Dynamic on-demand training

### Alur Komunikasi

```
User → Frontend (React) → API Request (HTTP POST) → Backend (FastAPI)
                                                          ↓
                                                   ML Pipeline:
                                                   1. Data Validation
                                                   2. Preprocessing
                                                   3. Train/Test Split (80/20)
                                                   4. Model Training (SVR & RF)
                                                   5. Evaluation (MAE, RMSE, R²)
                                                          ↓
Frontend ← JSON Response (Metrics, Predictions, Feature Importance)
    ↓
User Interface Update (Charts, Tables, Metrics)
```

---

## 💻 Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan sistem Anda telah memenuhi persyaratan berikut:

### Software yang Diperlukan

| Software    | Versi Minimum                       | Keterangan                                   |
| ----------- | ----------------------------------- | -------------------------------------------- |
| **Python**  | 3.8+                                | Untuk menjalankan Backend                    |
| **Node.js** | 16.0+                               | Untuk menjalankan Frontend                   |
| **npm**     | 8.0+                                | Package manager (terinstall bersama Node.js) |
| **Browser** | Chrome/Firefox/Edge (versi terbaru) | Untuk mengakses aplikasi                     |

### Dependencies Python (Backend)

Pastikan library berikut terinstall (akan otomatis terinstall melalui `requirements.txt`):

- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pandas` - Data manipulation
- `scikit-learn` - Machine Learning
- `numpy` - Numerical computing
- `python-multipart` - File upload handling

### Dependencies Node.js (Frontend)

Akan otomatis terinstall melalui `package.json`:

- `react` - UI library
- `react-router-dom` - Routing
- `recharts` - Data visualization
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

## 🚀 Cara Menjalankan Aplikasi

### Metode 1: Menggunakan Script Otomatis (RECOMMENDED)

#### Untuk Instalasi Pertama Kali:

1. **Buka Command Prompt atau Terminal** di folder root project
2. **Jalankan script instalasi:**

   ```bash
   INSTALL_DEPENDENCIES.bat
   ```

   Script ini akan otomatis:
   - Install Python dependencies di folder `backend`
   - Install Node.js dependencies di folder `frontend`

3. **Tunggu hingga proses selesai** (±2-5 menit tergantung koneksi internet)

#### Untuk Menjalankan Aplikasi:

1. **Double-click file:** `START_SEMUA.bat`

   Script ini akan otomatis:
   - Menjalankan Backend di `http://localhost:8000`
   - Menjalankan Frontend di `http://localhost:3000` atau `http://localhost:5173`

2. **Tunggu beberapa detik** hingga muncul:

   ```
   ✓ Backend is running on http://localhost:8000
   ✓ Frontend is running on http://localhost:3000
   ```

3. **Buka browser** dan akses: `http://localhost:3000` atau `http://localhost:5173`

> **💡 Tips:** Jangan tutup jendela Command Prompt yang muncul! Menutup jendela akan menghentikan server.

### Metode 2: Menjalankan Manual (Step-by-Step)

#### A. Menjalankan Backend (FastAPI)

1. **Buka Command Prompt/Terminal**

2. **Masuk ke folder backend:**

   ```bash
   cd backend
   ```

3. **Aktifkan virtual environment** (jika menggunakan venv):

   ```bash
   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate
   ```

4. **Install dependencies** (jika belum):

   ```bash
   python -m pip install -r requirements.txt
   ```

5. **Jalankan server:**

   ```bash
   python -m uvicorn main:app --reload
   ```

   Atau:

   ```bash
   python main.py
   ```

6. **Verifikasi Backend berjalan:**
   - Buka browser: `http://localhost:8000`
   - Akses API Documentation: `http://localhost:8000/docs`
   - Jika berhasil, akan muncul dokumentasi Swagger UI

> ✅ **Backend Ready** jika terlihat output: `Uvicorn running on http://127.0.0.1:8000`

#### B. Menjalankan Frontend (React + Vite)

1. **Buka Command Prompt/Terminal BARU** (biarkan terminal Backend tetap berjalan)

2. **Masuk ke folder frontend:**

   ```bash
   cd frontend
   ```

3. **Install dependencies** (jika belum):

   ```bash
   npm install
   ```

4. **Jalankan development server:**

   ```bash
   npm run dev
   ```

5. **Akses aplikasi:**
   - Terminal akan menampilkan URL, biasanya:
     - `http://localhost:5173` (Vite default), atau
     - `http://localhost:3000`
   - Buka URL tersebut di browser

> ✅ **Frontend Ready** jika browser menampilkan halaman aplikasi dengan judul "Sistem Prediksi Saham BBRI"

---

### Verifikasi Sistem Berjalan

Pastikan **KEDUA server berjalan** sebelum menggunakan aplikasi:

| Komponen         | URL                              | Status Check                  |
| ---------------- | -------------------------------- | ----------------------------- |
| **Backend API**  | http://localhost:8000            | Buka `/docs` untuk Swagger UI |
| **Frontend App** | http://localhost:3000 atau :5173 | Halaman aplikasi muncul       |

> ⚠️ **PENTING:** Jika salah satu server tidak berjalan, fitur upload dan prediksi tidak akan berfungsi!

---

## 📊 Ketentuan Format Data CSV

Agar sistem dapat memproses data dengan benar, file CSV yang diunggah **HARUS** memenuhi ketentuan berikut:

### ✅ Format File

- **Ekstensi:** Wajib berformat `.csv` (Comma-Separated Values)
- **Encoding:** UTF-8 (recommended)
- **Delimiter:** Koma (`,`)

### ✅ Struktur Kolom Wajib

File CSV harus memiliki **6 kolom** dengan nama persis seperti berikut:

| No  | Nama Kolom | Tipe Data   | Keterangan                                        |
| --- | ---------- | ----------- | ------------------------------------------------- |
| 1   | `Date`     | String/Date | Tanggal data (format: YYYY-MM-DD atau DD/MM/YYYY) |
| 2   | `Open`     | Numeric     | Harga pembukaan saham                             |
| 3   | `High`     | Numeric     | Harga tertinggi dalam periode                     |
| 4   | `Low`      | Numeric     | Harga terendah dalam periode                      |
| 5   | `Volume`   | Numeric     | Volume perdagangan                                |
| 6   | `Close`    | Numeric     | Harga penutupan saham (Target Prediksi)           |

### 📋 Contoh Data CSV yang Valid

```csv
Date,Open,High,Low,Volume,Close
2025-01-01,1340000,1360000,1330000,15420000,1350000
2025-01-02,1350000,1380000,1345000,16780000,1375000
2025-01-03,1375000,1390000,1370000,14230000,1385000
2025-01-04,1385000,1400000,1380000,17560000,1395000
2025-01-05,1395000,1410000,1385000,15890000,1405000
```

### 📝 Catatan Penting tentang Data

> **💡 Pembagian Data Otomatis:**  
> Sistem akan secara otomatis membagi dataset menjadi:
>
> - **80% Data Training** - Untuk melatih model SVR dan Random Forest
> - **20% Data Testing** - Untuk evaluasi performa model
>
> Pembagian ini menggunakan metode **time-based split** tanpa shuffle, sehingga urutan kronologis tetap terjaga.

> **⚠️ Minimum Jumlah Baris:**  
> Disarankan minimal **50 baris data** untuk hasil prediksi yang optimal. Jika data terlalu sedikit (<20 baris), hasil prediksi mungkin kurang akurat.

> **📌 Sample Data:**  
> File contoh data tersedia di: `backend/sample_data.csv`  
> Anda dapat menggunakan file ini untuk testing awal sistem.

### ❌ Kesalahan yang Sering Terjadi

| Masalah                           | Penyebab                  | Solusi                                           |
| --------------------------------- | ------------------------- | ------------------------------------------------ |
| Error: "Invalid file format"      | File bukan `.csv`         | Convert file ke format CSV                       |
| Error: "Missing required columns" | Nama kolom tidak sesuai   | Pastikan nama kolom exact match                  |
| Data tidak muncul di chart        | Kolom numerik berisi teks | Pastikan Open/High/Low/Volume/Close berisi angka |
| Prediksi sangat tidak akurat      | Data terlalu sedikit      | Gunakan minimal 50+ baris data                   |

---

## 🎯 Panduan Penggunaan Fitur

Sistem ini terdiri dari **4 halaman utama** yang dapat diakses melalui sidebar navigasi. Berikut panduan lengkap penggunaan setiap halaman:

---

### 1️⃣ Halaman SVR Prediction

**Fungsi:** Melakukan prediksi harga saham menggunakan algoritma Support Vector Regression (SVR)

#### Langkah Penggunaan:

1. **Upload File CSV**
   - Klik area upload (dropzone) atau drag-and-drop file CSV
   - Sistem akan validasi format file
   - Jika valid, nama file akan muncul di bawah area upload

2. **Jalankan Prediksi**
   - Klik tombol **"Run Prediction"**
   - Tunggu proses training (biasanya 5-15 detik)
   - Indikator loading akan muncul dengan teks: _"Sedang Melatih Model..."_

3. **Membaca Hasil Prediksi**

   **A. Data Information Banner (Top)**
   - Menampilkan statistik dataset:
     - Total baris data
     - Jumlah data training (80%)
     - Jumlah data testing (20%)
     - Rentang tanggal data

   **B. Metrics Cards (3 Kartu)**

   | Metrik   | Nama Lengkap                             | Interpretasi                                                                     |
   | -------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
   | **MAE**  | Mean Absolute Error                      | Rata-rata selisih absolut. **Semakin kecil = semakin baik**                      |
   | **RMSE** | Root Mean Squared Error                  | Akar kuadrat rata-rata error. **Semakin kecil = semakin baik**                   |
   | **R²**   | R-Squared (Coefficient of Determination) | Persentase varians yang dijelaskan model. **Semakin mendekati 1 = semakin baik** |

   **C. Line Chart (Grafik Garis)**
   - **Garis Ungu Tebal:** Data Aktual (harga saham sebenarnya)
   - **Garis Biru Putus-Putus:** Prediksi SVR
   - Hover mouse pada grafik untuk melihat nilai detail
   - Grafik menampilkan data testing untuk evaluasi

> **💡 Tips Interpretasi:**
>
> - Jika prediksi SVR (garis biru) mengikuti pola data aktual (garis ungu) dengan baik, artinya model akurat
> - Perhatikan MAE dan RMSE: nilai < 0.05 umumnya dianggap baik untuk data normalized
> - R² > 0.90 menunjukkan model sangat baik

---

### 2️⃣ Halaman RF Prediction

**Fungsi:** Melakukan prediksi harga saham menggunakan algoritma Random Forest Regressor

#### Langkah Penggunaan:

Sama persis dengan halaman SVR Prediction, dengan perbedaan:

1. **Upload File CSV** - Jika sudah upload di halaman SVR, data akan otomatis tersedia (Context API)
2. **Klik "Run Prediction"** - Proses training Random Forest
3. **Membaca Hasil:**
   - Metrics: MAE, RMSE, R² untuk model Random Forest
   - Line Chart: Garis merah putus-putus = Prediksi Random Forest

> **🔄 Data Persistence:**  
> Data yang sudah diupload di halaman SVR/RF akan tetap tersedia saat berpindah halaman. Tidak perlu upload ulang!

---

### 3️⃣ Halaman Feature Selection

**Fungsi:** Menampilkan tingkat kepentingan (importance) setiap variabel input terhadap prediksi harga Close

#### Apa yang Ditampilkan:

1. **Tabel Feature Importance**

   | Kolom            | Keterangan                                                 |
   | ---------------- | ---------------------------------------------------------- |
   | Rank             | Peringkat kepentingan fitur (1 = paling penting)           |
   | Feature Name     | Nama variabel: Open, High, Low, Volume                     |
   | Importance Score | Skor kepentingan (0.0 - 1.0)                               |
   | Status           | "Terpilih" jika score > 0.15, "Tidak Terpilih" jika ≤ 0.15 |

2. **Bar Chart Horizontal**
   - Visualisasi kepentingan fitur dalam bentuk grafik batang
   - Batang paling panjang = fitur paling berpengaruh
   - Warna ungu = fitur terpilih, Abu-abu = fitur kurang signifikan

#### Cara Membaca:

**Contoh Interpretasi:**

```
Volume: 0.4523 → Volume perdagangan paling berpengaruh (45.23%)
Open: 0.3012 → Harga pembukaan berpengaruh sedang (30.12%)
High: 0.1567 → Harga tertinggi berpengaruh rendah (15.67%)
Low: 0.0898 → Harga terendah paling tidak berpengaruh (8.98%)
```

> **📊 Catatan:**  
> Feature importance dihitung menggunakan **Random Forest Feature Importance** yang mengukur seberapa sering suatu fitur digunakan untuk membuat keputusan dalam decision tree.

> **⚠️ Prasyarat:**  
> Halaman ini hanya menampilkan data setelah Anda menjalankan prediksi di halaman SVR atau RF Prediction.

---

### 4️⃣ Halaman Model Evaluation

**Fungsi:** Membandingkan performa SVR dan Random Forest secara komprehensif

#### Komponen Halaman:

**A. Top Section: Metrics Comparison Cards**

Dua kartu besar menampilkan metrik masing-masing model:

- **Kartu Kiri:** Support Vector Regression (SVR)
  - MAE, RMSE, R² model SVR
- **Kartu Kanan:** Random Forest Regressor (RF)
  - MAE, RMSE, R² model Random Forest

**B. Middle Section (Kiri): Grouped Bar Chart**

Grafik batang perbandingan metrik:

- Sumbu X: Metrik (MAE, RMSE, R²)
- Sumbu Y: Nilai metrik
- **Batang Biru Tua:** SVR
- **Batang Ungu:** Random Forest
- Hover untuk melihat nilai exact

**C. Middle Section (Kanan): Ringkasan Hasil**

Sistem otomatis menentukan:

1. 🏆 **Model Terbaik** - Dipilih berdasarkan RMSE terendah
2. 📈 **RMSE Terendah** - Model mana yang paling akurat
3. 🎯 **MAE Terendah** - Model dengan error absolut terkecil
4. 🎯 **R² Tertinggi** - Model dengan kemampuan prediksi terbaik

**Contoh Output:**

```
🏆 Model Terbaik: SVR
📈 RMSE Terendah: 0.0337 (SVR)
🎯 MAE Terendah: 0.0214 (SVR)
🎯 R² Tertinggi: 0.9192 (SVR)
```

**D. Bottom Section: Multi-Line Comparison Chart**

Grafik garis besar yang membandingkan:

- **Garis Ungu Tebal:** Data Aktual (ground truth)
- **Garis Biru Putus-Putus:** Prediksi SVR
- **Garis Merah Putus-Putus:** Prediksi Random Forest

**Cara Membaca:**

- Garis prediksi yang lebih dekat dengan garis aktual = model lebih akurat
- Jika garis SVR dan RF hampir berhimpitan = kedua model memiliki performa serupa
- Perhatikan titik-titik divergence (perbedaan besar) untuk analisis error

> **💡 Insight:**  
> Halaman ini adalah **halaman paling penting** untuk evaluasi komparatif. Gunakan halaman ini untuk:
>
> - Menulis hasil penelitian/skripsi
> - Presentasi perbandingan algoritma
> - Menentukan model mana yang lebih cocok untuk kasus Anda

> **📌 Prasyarat:**  
> Halaman ini memerlukan data dari prediksi SVR DAN Random Forest. Pastikan sudah menjalankan prediksi di kedua halaman sebelumnya.

---

## 🔄 Alur Penggunaan Lengkap (Recommended Workflow)

Berikut alur penggunaan optimal untuk mendapatkan hasil maksimal:

```
1. Start → Jalankan Backend & Frontend
          ↓
2. Navigasi ke "SVR Prediction"
          ↓
3. Upload file CSV → Klik "Run Prediction" → Tunggu hasil
          ↓
4. (Optional) Navigasi ke "RF Prediction" → Data sudah tersedia → Klik "Run Prediction"
          ↓
5. Navigasi ke "Feature Selection" → Analisis fitur penting
          ↓
6. Navigasi ke "Model Evaluation" → Lihat perbandingan lengkap
          ↓
7. Screenshot/Export hasil untuk dokumentasi
```

---

## 🔧 Troubleshooting

### Masalah 1: Gagal Upload File

**Gejala:**

- File tidak bisa diupload
- Muncul pesan error: "File harus berformat CSV"

**Penyebab & Solusi:**

| Penyebab                                         | Solusi                                                    |
| ------------------------------------------------ | --------------------------------------------------------- |
| File bukan format `.csv`                         | Convert file dari Excel/XLSX ke CSV                       |
| Ekstensi file salah (mis: `.txt` diganti manual) | Save ulang dari aplikasi spreadsheet dengan "Save As CSV" |
| File kosong atau corrupt                         | Buka file dengan text editor, pastikan ada data           |

---

### Masalah 2: Error "Connection Refused" / "Failed to Fetch"

**Gejala:**

- Muncul alert: "Gagal melakukan prediksi"
- Console browser menampilkan error network

**Penyebab & Solusi:**

1. **Backend tidak berjalan**
   - Cek terminal backend masih buka dan running
   - Akses `http://localhost:8000/docs` di browser
   - Jika gagal, restart backend: `python -m uvicorn main:app --reload`

2. **Port conflict**
   - Backend mungkin tidak berjalan di port 8000
   - Cek terminal backend untuk melihat port yang digunakan
   - Update URL di `frontend/src/context/DataContext.jsx` jika perlu

3. **CORS Issue**
   - Pastikan `CORSMiddleware` dikonfigurasi dengan benar di `backend/main.py`
   - Restart backend setelah perubahan konfigurasi

---

### Masalah 3: Data Tidak Muncul / Halaman Kosong

**Gejala:**

- Setelah upload, chart tidak muncul
- Metrics menampilkan "0.0000" atau kosong
- Halaman Feature Selection/Model Evaluation kosong

**Penyebab & Solusi:**

1. **Belum klik "Run Prediction"**
   - Upload file saja tidak cukup
   - Pastikan tombol "Run Prediction" sudah diklik

2. **Kolom CSV tidak sesuai**
   - Buka file CSV dengan text editor
   - Pastikan baris pertama (header) exact: `Date,Open,High,Low,Volume,Close`
   - Tidak ada spasi ekstra atau typo

3. **Data mengandung nilai kosong (NaN)**
   - Pastikan tidak ada cell kosong di Excel sebelum save as CSV
   - Hapus baris yang mengandung data kosong

4. **Browser cache**
   - Tekan `Ctrl + Shift + R` (hard refresh)
   - Atau buka Incognito/Private mode

---

### Masalah 4: Proses Training Terlalu Lama

**Gejala:**

- Loading spinner tidak berhenti
- Tombol "Sedang Melatih Model..." tidak berubah kembali

**Penyebab & Solusi:**

1. **Dataset terlalu besar**
   - Jika data >10,000 baris, proses bisa memakan waktu 30-60 detik
   - **Solusi:** Tunggu hingga selesai, atau kurangi jumlah data

2. **Backend crash/error**
   - Cek terminal backend untuk error message
   - Restart backend jika ada error Python
   - Cek log: `ModuleNotFoundError`, `MemoryError`, dll.

3. **Timeout**
   - Jika >2 menit tidak ada response, refresh browser
   - Restart backend dan frontend
   - Coba dengan dataset yang lebih kecil

---

### Masalah 5: Hasil Prediksi Sangat Tidak Akurat

**Gejala:**

- MAE/RMSE sangat besar (>0.5)
- R² mendekati 0 atau negatif
- Garis prediksi sangat jauh dari data aktual

**Penyebab & Solusi:**

1. **Data terlalu sedikit**
   - Minimum 50 baris untuk hasil yang reasonable
   - **Solusi:** Gunakan dataset yang lebih besar

2. **Data tidak representatif**
   - Data hanya dari periode anomali (misal: crash market)
   - **Solusi:** Gunakan data dari periode yang lebih stabil dan panjang

3. **Scaling issue**
   - Jika nilai Close berbeda sangat jauh dari Open/High/Low
   - **Solusi:** Sistem sudah handle MinMaxScaler, tapi pastikan data tidak ada outlier ekstrim

4. **Kolom salah**
   - Mungkin kolom "Close" dan "Open" tertukar
   - **Solusi:** Verifikasi ulang data CSV

---

### Masalah 6: Metrics Tidak Muncul di Model Evaluation

**Gejala:**

- Halaman Model Evaluation kosong
- Muncul pesan: "Tidak Ada Data Evaluasi"

**Penyebab & Solusi:**

1. **Belum run prediction**
   - Halaman ini memerlukan data dari SVR/RF Prediction
   - **Solusi:** Jalankan prediksi minimal di satu halaman (SVR atau RF)

2. **Context API issue**
   - Data hilang karena refresh browser
   - **Solusi:** Upload dan run prediction ulang

---

### Masalah 7: Port Already in Use

**Gejala:**

- Error: `Address already in use` atau `Port 8000 is already allocated`

**Solusi:**

**Windows:**

```bash
# Cari process yang menggunakan port 8000
netstat -ano | findstr :8000

# Kill process (ganti PID dengan Process ID dari output di atas)
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Cari process
lsof -i :8000

# Kill process
kill -9 <PID>
```

Atau gunakan port lain:

```bash
# Backend di port 8001
uvicorn main:app --reload --port 8001
```

---

### Quick Checklist Debugging

Gunakan checklist ini untuk troubleshooting cepat:

- [ ] Backend berjalan di `http://localhost:8000`?
- [ ] Frontend berjalan di `http://localhost:3000` atau `:5173`?
- [ ] File CSV memiliki 6 kolom dengan nama yang benar?
- [ ] File CSV minimal 20+ baris data?
- [ ] Tidak ada cell kosong di file CSV?
- [ ] Sudah klik "Run Prediction" setelah upload?
- [ ] Browser console tidak menampilkan error merah?
- [ ] Terminal backend tidak menampilkan error Python?

---

## ❓ FAQ (Pertanyaan yang Sering Diajukan)

### 1. Apakah data yang diupload disimpan di server?

**Jawab:** Tidak. Data CSV hanya diproses di memori (RAM) dan tidak disimpan ke disk. Setelah browser ditutup, data akan hilang. Sistem ini aman untuk data sensitif.

---

### 2. Berapa lama waktu training model?

**Jawab:**

- Dataset 50-100 baris: ~5-10 detik
- Dataset 100-500 baris: ~10-20 detik
- Dataset 500-1000 baris: ~20-40 detik
- Dataset >1000 baris: ~40-90 detik

Waktu tergantung spesifikasi komputer (CPU, RAM).

---

### 3. Apakah bisa menggunakan data selain saham BBRI?

**Jawab:** Ya! Sistem ini bersifat generic dan dapat digunakan untuk:

- Saham lain (TLKM, BBCA, ASII, dll.)
- Cryptocurrency (Bitcoin, Ethereum, dll.)
- Komoditas (emas, minyak, dll.)
- Forex (USD/IDR, EUR/USD, dll.)

Asalkan format CSV sesuai ketentuan (Date, Open, High, Low, Volume, Close).

---

### 4. Mengapa hasil prediksi SVR dan RF berbeda?

**Jawab:**
SVR dan Random Forest adalah algoritma yang berbeda:

- **SVR:** Menggunakan kernel trick dan support vectors, cocok untuk data non-linear
- **Random Forest:** Ensemble dari banyak decision trees, robust terhadap overfitting

Perbedaan hasil adalah hal yang normal dan justru menjadi tujuan komparatif sistem ini.

---

### 5. Apakah bisa export hasil prediksi?

**Jawab:** Saat ini belum ada fitur export otomatis. Anda dapat:

- **Screenshot** halaman metrics dan chart
- **Copy data** dari browser DevTools → Network → Response
- **Dokumentasi manual** dengan mencatat nilai metrics

---

### 6. Bagaimana jika data memiliki missing values (NaN)?

**Jawab:** Sistem saat ini tidak handle missing values secara otomatis. Anda harus:

1. Bersihkan data terlebih dahulu di Excel/Google Sheets
2. Hapus baris dengan data kosong, atau
3. Isi dengan nilai interpolasi/mean

---

### 7. Apakah model disimpan setelah training?

**Jawab:** Tidak. Model di-train ulang setiap kali "Run Prediction". Ini memastikan model selalu fresh dengan data terbaru yang diupload.

---

### 8. Apa itu R² dan bagaimana interpretasinya?

**Jawab:**
R² (R-Squared) mengukur seberapa baik model menjelaskan variasi data:

- **R² = 1.0:** Model sempurna (100% akurat)
- **R² = 0.9:** Model sangat baik (90% variasi dijelaskan)
- **R² = 0.7:** Model cukup baik
- **R² = 0.5:** Model kurang baik
- **R² < 0.3:** Model buruk
- **R² negatif:** Model lebih buruk dari rata-rata

---

### 9. Mengapa perlu split 80/20 untuk training/testing?

**Jawab:**

- **80% Training:** Data untuk model "belajar" pola
- **20% Testing:** Data yang belum pernah dilihat model, untuk evaluasi objektif

Jika kita evaluasi dengan data training, hasilnya bias (model sudah "menghafal" data).

---

### 10. Apakah bisa melakukan prediksi untuk masa depan (future prediction)?

**Jawab:**
Saat ini sistem hanya melakukan **retrospective evaluation** (evaluasi pada data testing yang sudah ada).

Untuk prediksi masa depan, diperlukan:

- Modifikasi backend untuk forecasting
- Implementasi time series forecasting (ARIMA, LSTM, dll.)
- Input fitur untuk periode mendatang

---

### 11. Berapa akurasi minimal yang dianggap baik?

**Jawab:**
Untuk data saham yang sudah dinormalisasi:

- **MAE < 0.03:** Sangat baik
- **MAE 0.03-0.05:** Baik
- **MAE 0.05-0.10:** Cukup
- **MAE > 0.10:** Kurang baik

- **RMSE < 0.04:** Sangat baik
- **RMSE 0.04-0.06:** Baik
- **RMSE 0.06-0.12:** Cukup
- **RMSE > 0.12:** Kurang baik

- **R² > 0.90:** Sangat baik
- **R² 0.80-0.90:** Baik
- **R² 0.70-0.80:** Cukup
- **R² < 0.70:** Kurang baik

---

### 12. Bagaimana cara mengakses API secara langsung (untuk testing/development)?

**Jawab:**
Akses Swagger UI di: `http://localhost:8000/docs`

Dari sana Anda bisa:

- Melihat dokumentasi API lengkap
- Test endpoint secara interaktif
- Melihat request/response format

---

---

## 📚 Referensi Tambahan

### Dokumentasi Teknis

| Dokumen                               | Deskripsi                        |
| ------------------------------------- | -------------------------------- |
| `README.md`                           | Overview project dan quick start |
| `API_DOCUMENTATION.md`                | Dokumentasi endpoint API Backend |
| `CONTEXT_API_INTEGRATION_COMPLETE.md` | Detail implementasi Context API  |
| `DESIGN_DOCUMENTATION.md`             | Spesifikasi desain UI/UX         |
| `MULAI_DISINI.md`                     | Panduan instalasi untuk pemula   |

### Teknologi yang Digunakan

**Frontend:**

- [React.js](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Recharts](https://recharts.org/) - Charting Library
- [React Router](https://reactrouter.com/) - Routing

**Backend:**

- [FastAPI](https://fastapi.tiangolo.com/) - Web Framework
- [scikit-learn](https://scikit-learn.org/) - Machine Learning
- [Pandas](https://pandas.pydata.org/) - Data Analysis
- [NumPy](https://numpy.org/) - Numerical Computing

### Algoritma Machine Learning

**Support Vector Regression (SVR):**

- [scikit-learn SVR Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVR.html)
- Kernel: RBF (Radial Basis Function)
- Parameters: C=100, gamma=0.1

**Random Forest Regressor:**

- [scikit-learn RandomForest Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html)
- Parameters: n_estimators=100, random_state=42

---

## 📞 Dukungan & Kontak

Jika mengalami masalah yang tidak tercantum dalam panduan ini:

1. **Cek dokumentasi teknis** di folder project
2. **Lihat log error** di terminal Backend dan Browser Console (F12)
3. **Restart sistem** (Backend & Frontend)
4. **Gunakan sample data** (`backend/sample_data.csv`) untuk memastikan sistem berfungsi

---

## ✅ Checklist untuk Presentasi/Demo

Gunakan checklist ini sebelum presentasi atau demo ke dosen:

- [ ] Backend dan Frontend berjalan tanpa error
- [ ] File `sample_data.csv` siap digunakan
- [ ] Browser sudah dibuka di halaman aplikasi
- [ ] Sudah test upload → run prediction sekali
- [ ] Screenshot hasil prediksi sudah disiapkan
- [ ] Memahami interpretasi setiap metrik (MAE, RMSE, R²)
- [ ] Siap menjelaskan perbedaan SVR vs Random Forest
- [ ] Siap menjelaskan Feature Importance
- [ ] Terminal/Command Prompt tidak ada error merah

---

## 📝 Catatan untuk Dokumentasi Skripsi

**Hal yang Perlu Dicantumkan:**

1. **Metodologi:**
   - Preprocessing: MinMaxScaler
   - Train/Test Split: 80/20 time-based
   - Algoritma: SVR (kernel RBF) & Random Forest (100 estimators)
   - Evaluasi: MAE, RMSE, R²

2. **Hasil:**
   - Tabel perbandingan metrik SVR vs RF
   - Screenshot grafik prediksi
   - Interpretasi hasil (model mana yang lebih baik)
   - Feature importance ranking

3. **Implementasi:**
   - Arsitektur sistem (Frontend-Backend)
   - Teknologi yang digunakan
   - Alur kerja sistem

---

## 🎓 Tips untuk Presentasi Skripsi

### Persiapan Demo:

1. **Simulasi Lengkap:**
   - Latih alur: Start system → Upload → Run → Explain results
   - Waktu total demo: 5-7 menit
2. **Backup Plan:**
   - Siapkan video recording demo (jika sistem error saat presentasi)
   - Screenshot semua halaman dengan hasil prediksi
   - Print metrics comparison table

3. **Penjelasan yang Harus Dikuasai:**
   - Mengapa pilih SVR dan Random Forest?
   - Apa perbedaan keduanya?
   - Mengapa MAE/RMSE kecil = baik, R² besar = baik?
   - Bagaimana interpretasi Feature Importance?
   - Apa kelebihan dan kekurangan masing-masing algoritma?

### Pertanyaan yang Mungkin Ditanyakan Dosen:

**Q1:** "Mengapa tidak menggunakan Deep Learning (LSTM/GRU)?"  
**A:** SVR dan Random Forest lebih interpretable dan tidak memerlukan data training yang sangat besar. Untuk dataset kecil-menengah (<1000 baris), traditional ML sering lebih efisien.

**Q2:** "Bagaimana mengatasi overfitting?"  
**A:**

- Random Forest: Menggunakan ensemble dari banyak trees
- Train/Test Split: Evaluasi pada data yang tidak pernah dilihat model
- MinMaxScaler: Normalisasi untuk stabilitas

**Q3:** "Apakah hasil prediksi bisa digunakan untuk trading real?"  
**A:** Sistem ini untuk keperluan penelitian/edukasi. Trading real memerlukan:

- Data real-time
- Analisis sentimen berita
- Faktor eksternal (ekonomi makro, politik, dll.)
- Risk management yang kompleks

**Q4:** "Berapa akurasi sistem ini?"  
**A:** Tergantung kualitas data. Pada dataset sample, SVR mencapai R² ~0.92 (92% variasi data dijelaskan model).

---

## 📊 Contoh Output Sistem

### Sample Metrics Output:

**Support Vector Regression (SVR):**

```
MAE:  0.0214
RMSE: 0.0337
R²:   0.9192
```

**Random Forest Regressor:**

```
MAE:  0.0248
RMSE: 0.0389
R²:   0.9015
```

**Kesimpulan:** SVR lebih akurat untuk dataset ini (RMSE lebih rendah, R² lebih tinggi).

---

### Sample Feature Importance:

| Rank | Feature | Importance | Status            |
| ---- | ------- | ---------- | ----------------- |
| 1    | Volume  | 0.4523     | ✅ Terpilih       |
| 2    | Open    | 0.3012     | ✅ Terpilih       |
| 3    | High    | 0.1567     | ✅ Terpilih       |
| 4    | Low     | 0.0898     | ❌ Tidak Terpilih |

**Interpretasi:** Volume perdagangan adalah faktor paling berpengaruh (45.23%) dalam memprediksi harga Close.

---

## 🔐 Keamanan & Privacy

- ✅ Data CSV **tidak disimpan** di server
- ✅ Data hanya ada di **memori RAM** selama proses
- ✅ Tidak ada logging data sensitif
- ✅ Aplikasi berjalan **localhost only** (tidak expose ke internet)
- ✅ Tidak ada autentikasi = tidak ada penyimpanan credentials

> **⚠️ Catatan Keamanan:**  
> Sistem ini dirancang untuk **development/research** di lingkungan lokal. Jika ingin deploy ke production/server public, tambahkan:
>
> - Authentication & Authorization
> - HTTPS encryption
> - Rate limiting
> - Input validation yang lebih ketat

---

## 🎯 Kesimpulan

**Sistem Prediksi Saham BBRI** adalah aplikasi full-stack yang mengintegrasikan Machine Learning untuk analisis prediktif harga saham. Dengan antarmuka yang intuitif dan visualisasi yang komprehensif, sistem ini cocok untuk:

- 📚 Keperluan riset dan skripsi
- 🎓 Pembelajaran algoritma Machine Learning
- 📊 Analisis komparatif SVR vs Random Forest
- 🔍 Eksplorasi feature importance dalam time series

### Fitur Utama:

✅ Dynamic model training on-demand  
✅ Real-time visualization dengan Recharts  
✅ Comprehensive metrics evaluation (MAE, RMSE, R²)  
✅ Feature importance analysis  
✅ Side-by-side model comparison  
✅ Persistent data dengan Context API  
✅ User-friendly interface dengan Tailwind CSS

---

## 📜 Lisensi & Penggunaan

Sistem ini dikembangkan untuk keperluan edukasi dan penelitian. Untuk penggunaan komersial atau modifikasi, silakan hubungi pengembang.

---

## 🙏 Terima Kasih

Terima kasih telah menggunakan **Sistem Prediksi Saham BBRI**. Semoga panduan ini membantu Anda dalam mengoperasikan sistem dan memahami hasil prediksi.

**Selamat menggunakan dan sukses untuk presentasi/skripsi Anda! 🚀**

---

**Dokumen ini dibuat:** 29 Juli 2026  
**Versi:** 1.0  
**Status:** Final ✅

---

> **💡 Tip Terakhir:**  
> Simpan file ini dalam format PDF untuk dilampirkan sebagai User Manual di skripsi Anda!

---
