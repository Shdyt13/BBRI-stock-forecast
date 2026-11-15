<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" width="140" alt="Logo BBRI" />

# 💻 Frontend Dashboard — Sistem Prediksi Harga Saham BBRI
### *Antarmuka Decision Support System (DSS) Berbasis React 19, Vite, Tailwind CSS & Recharts*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.8-22B5BF?style=for-the-badge)](https://recharts.org/)

</div>

---

## 📖 Gambaran Umum

Modul `frontend` ini menyajikan antarmuka web interaktif untuk memvisualisasikan proses prediksi harga saham **PT Bank Rakyat Indonesia (Persero) Tbk (BBRI)** menggunakan algoritma **Support Vector Regression (SVR)** dan **Random Forest Regressor (RFR)**.

### Tiga Halaman Utama Antarmuka (`src/App.jsx`)
1. **Dashboard:**
   - Unggah dataset *Training* dan *Testing* berformat CSV.
   - Kartu informasi metadata dataset (Rentang Tanggal, Jumlah Data `2.168 + 543`, Jumlah Fitur `6`, Target `Close Price`).
   - Pengaturan skenario prediksi: **Ya (Rekomendasi / Seleksi Fitur Top-4)** atau **Tidak (Seluruh 6 Fitur)**.
   - **Grafik Aktual vs Prediksi (50 Data Terakhir)** dengan sumbu tanggal perdagangan dan rentang harga Rupiah yang proporsional.
   - Kartu ringkasan **Target Perdagangan ($T+1$)** dilengkapi *hover tooltip* analisis perbandingan presisi SVR dan RFR terhadap harga *benchmark* pasar.
2. **Feature Selection:**
   - Kartu ringkasan jumlah fitur awal (`6`), fitur terpilih (`4`), dan metode seleksi (*Random Forest Feature Importance*).
   - Tabel peringkat kontribusi fitur (`Selected` vs. `Dropped`) berdampingan dengan grafik batang horizontal *Importance Score*.
3. **Model Evaluation:**
   - Tabel komparasi metrik **MAE**, **RMSE**, dan **$R^2$** untuk keempat kombinasi model dan skenario.
   - Dua grafik evaluasi terpisah secara berdampingan:
     - **Grafik Perbandingan Metrik Error (MAE & RMSE)** pada rentang `0 – 100`.
     - **Grafik Perbandingan Metrik $R^2$** pada rentang `0,90 – 1,00` agar perbedaan akurasi antar model terlihat jelas.

---

## 🚀 Cara Menjalankan Frontend

Pastikan server `backend` sudah berjalan di `http://localhost:8000`, kemudian jalankan perintah berikut:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173` pada browser untuk mengakses aplikasi.

### Build untuk Produksi
```bash
npm run build
npm run preview
```
