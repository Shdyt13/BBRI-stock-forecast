<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" width="150" alt="Logo BBRI">
  <h1>📈 Sistem Prediksi Harga Saham BBRI</h1>
  <h3><i>Working Paper (Implementasi Sistem Tugas Akhir)</i></h3>
  
  [![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3%2B-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
  [![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
</div>

---

> **Penulis:** Oldyn Septiana Sinurat (NIM: 2101020075)  
> **Institusi:** Program Studi Teknik Informatika, Fakultas Teknik dan Teknologi Kemaritiman, Universitas Maritim Raja Ali Haji (UMRAH), Tanjungpinang, 2026

---

## 📖 1. Latar Belakang Penelitian
Pergerakan harga saham, seperti saham PT Bank Rakyat Indonesia (Persero) Tbk (BBRI), dikenal memiliki karakteristik yang dinamis, kompleks, dan sangat fluktuatif (volatil). Untuk menghadapi data runtun waktu (*time series*) finansial, *Machine Learning* telah menjadi pendekatan utama karena kemampuannya mempelajari pola non-linear dari data historis. 

Penelitian ini membandingkan kinerja dua algoritma *Machine Learning* populer dalam ranah regresi harga saham: **Support Vector Regression (SVR)** dan **Random Forest Regressor**. Kebaruan (*novelty*) pada penelitian ini terletak pada integrasi tahap seleksi fitur (*Feature Selection*) menggunakan metode *Feature Importance* dari algoritma Random Forest untuk mereduksi dimensi data, mengurangi *noise*, dan meningkatkan kapabilitas generalisasi model.

## ⚙️ 2. Metodologi (Implementasi Backend)
Sistem (Backend API) ini mengimplementasikan tahapan riset sesuai dengan proposal penelitian:

1. 📥 **Pengumpulan Data:** Dataset historis harian BBRI diperoleh dari Yahoo Finance (periode 2015-2025).
2. 🧹 **Pra-pemrosesan Data (Data Preprocessing):**
   - *Data Cleaning:* Mengatasi *missing values* pada data saham harian menggunakan metode `Forward Fill`.
   - *Transformasi:* Melakukan transformasi nilai harga penutupan (*Close Price*) menjadi *Log Return Harian* untuk menstabilkan varians.
   - *Normalisasi:* Menggunakan *Min-Max Scaling* agar setiap fitur berada dalam rentang `[0, 1]`.
3. 🎯 **Pembentukan Target:** Membentuk prediksi satu langkah ke depan (*one-step-ahead forecasting*), di mana model memprediksi *Log Return* untuk hari perdagangan berikutnya.
4. ✂️ **Seleksi Fitur:** Memilih fitur dengan *importance score* teratas (*Top-4*) dari himpunan (`Open`, `High`, `Low`, `Close`, `Adj Close`, `Volume`).
5. 🧠 **Pemodelan & Pelatihan:**
   - Menerima dataset training dan testing secara terpisah. Data training dipakai untuk fitting dan pelatihan, sedangkan data testing hanya dipakai untuk evaluasi.
   - Melakukan *Hyperparameter Tuning* menggunakan `GridSearchCV`.
6. 🧪 **Skenario Eksperimen:**
   - **Skenario 1:** Pelatihan dan prediksi menggunakan *seluruh fitur*.
   - **Skenario 2:** Pelatihan dan prediksi menggunakan *4 fitur terpilih* (*Selected Features*).

## 📊 3. Metrik Evaluasi Model
Kinerja algoritma pada sistem dievaluasi secara matematis menggunakan 3 metrik regresi yang membandingkan nilai aktual dengan nilai prediksi:
*   **Mean Absolute Error (MAE):** Rata-rata selisih absolut dari kesalahan prediksi.
*   **Root Mean Square Error (RMSE):** Akar kuadrat dari rata-rata kuadrat kesalahan (memberi bobot lebih/penalti pada *outlier* atau deviasi ekstrem).
*   **Koefisien Determinasi ($R^2$):** Metrik untuk mengukur proporsi varians fluktuasi harga saham yang dapat diprediksi dengan tepat oleh variabel *input*.

---

## 🚀 4. Panduan Menjalankan Sistem (Eksperimen)

Proyek ini menggunakan arsitektur **FastAPI** dan mendukung penuh kontainerisasi dengan **Docker** agar pengujian model dapat berjalan stabil di berbagai lingkungan komputasi.

### Opsi A: Menjalankan dengan Docker Compose (Direkomendasikan) 🐳

Pastikan [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstal dan berjalan. Cara ini akan mengotomatiskan *build* dan konfigurasi.

1. **Buka Terminal/Command Prompt** di direktori utama (root) proyek (`Stock_Prediction_System`).
2. **Jalankan Docker Compose:**
   ```bash
   docker compose up -d
   ```
   *(Backend FastAPI akan otomatis berjalan di background pada port `8000`)*
3. **Jalankan Frontend (React/Vite):**
   Buka terminal baru, pindah ke folder frontend, lalu jalankan:
   ```bash
   cd frontend
   npm run dev
   ```
   Aplikasi antarmuka akan dapat diakses melalui browser di `http://localhost:5173/`.

### Opsi B: Menjalankan secara Manual (Local Python) 🐍

Jika Anda ingin menjalankan atau memodifikasi algoritma regresi langsung di perangkat lokal tanpa Docker:

1. **Install dependensi library Python:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Jalankan server menggunakan Uvicorn:**
   ```bash
   uvicorn main:app --reload
   ```

Aplikasi backend akan berjalan pada `http://localhost:8000`. Eksekusi algoritma dilakukan melalui Endpoint `/api/predict` yang akan memicu *pipeline Machine Learning* yang melingkupi pembersihan data, seleksi fitur, pembagian waktu, *grid-search tuning* SVR & RF, serta pengembalian matriks evaluasi dan hasil *forecasting*. Laporan komprehensif metrik evaluasi beserta data grafik bisa diekspor dalam bentuk `.xlsx`.

---
<div align="center">
  <i>Dokumen README ini merupakan bagian dari prototipe fungsional (Working Paper) untuk penyusunan dan pengujian eksperimen Tugas Akhir.</i>
</div>
*Dokumen README ini merupakan bagian dari prototipe fungsional (Working Paper) untuk penyusunan dan pengujian eksperimen Tugas Akhir.*