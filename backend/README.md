# 📚 API Documentation: Prediksi Saham BBRI

**Base URL:** `http://localhost:8000`  
**CORS:** Sudah diizinkan untuk semua origin (`*`).

Aplikasi *Frontend* perlu memanggil dua *endpoint* secara berurutan: pertama untuk mengunggah file CSV, dan kedua untuk menjalankan komputasi *Machine Learning*.

---

## 1. Upload Dataset
Digunakan untuk mengunggah file CSV mentah (misal: `BBRI_2015_2025.csv`), membersihkannya, dan menyimpannya di *server* sementara.

*   **URL:** `/api/upload`
*   **Method:** `POST`
*   **Content-Type:** `multipart/form-data`

### Request (React.js / Axios Example)
```javascript
const formData = new FormData();
formData.append("file", selectedFile); // selectedFile didapat dari input type="file"

const response = await axios.post("http://localhost:8000/api/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
Success Response (200 OK)
JSON
{
  "message": "Dataset berhasil diunggah dan diproses!",
  "rows": 2710,
  "last_date": "2025-12-30 00:00:00"
}
2. Run Prediction & Feature Selection
Ini adalah endpoint utama. Saat dipanggil, backend akan otomatis:

Melakukan Feature Selection.

Membagi data (80:20).

Melakukan Hyperparameter Tuning & Training untuk SVR dan Random Forest (pada dua skenario).

Menghitung prediksi untuk H+1.

URL: /api/predict

Method: POST

Content-Type: application/json

Catatan untuk Frontend: Proses ini memakan waktu beberapa detik hingga menit karena proses pencarian parameter / GridSearch. Pastikan untuk menampilkan Loading Spinner di UI.

Request (React.js / Axios Example)
JavaScript
// Tidak perlu mengirim body/payload apa pun
const response = await axios.post("http://localhost:8000/api/predict");
const data = response.data;
Success Response (200 OK) - Struktur JSON
Berikut adalah struktur data yang akan dikembalikan. Frontend dapat memecah data ini untuk didistribusikan ke masing-masing komponen UI:

JSON
{
  "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
  
  "prediction": {
    "base_date": "2025-12-30",
    "prediction_date": "2026-01-02",
    "last_actual_close": 3640.0,
    "SVR": {
      "predicted_log_return": 0.0123,
      "predicted_close": 3685.03
    },
    "RandomForest": {
      "predicted_log_return": 0.0105,
      "predicted_close": 3678.40
    }
  },

  "feature_selection": {
    "selected_features": ["Open", "High", "Low", "Close"],
    "ranking": [
      { "name": "Open", "score": 0.312, "rank": 1, "status": "selected" },
      { "name": "High", "score": 0.280, "rank": 2, "status": "selected" },
      { "name": "Low", "score": 0.250, "rank": 3, "status": "selected" },
      { "name": "Close", "score": 0.100, "rank": 4, "status": "selected" },
      { "name": "Adj Close", "score": 0.040, "rank": 5, "status": "dropped" },
      { "name": "Volume", "score": 0.018, "rank": 6, "status": "dropped" }
    ]
  },

  "metrics": {
    "All_Features": {
      "SVR": { "MAE": 0.0214, "RMSE": 0.0337, "R2": 0.9192 },
      "RandomForest": { "MAE": 0.0248, "RMSE": 0.0389, "R2": 0.9015 }
    },
    "Selected_Features": {
      "SVR": { "MAE": 0.0169, "RMSE": 0.0221, "R2": 0.9410 },
      "RandomForest": { "MAE": 0.0121, "RMSE": 0.0171, "R2": 0.9520 }
    }
  },

  "chart_data": {
    "actual": [ -0.0160, 0.0319, 0.0078 ], 
    "svr_selected": [ 0.0145, 0.0124, 0.0124 ],
    "rf_selected": [ 0.0329, -0.0045, -0.0129 ]
  }
}
💡 Panduan Integrasi UI untuk Frontend Developer
1. Komponen Dashboard (Nilai Prediksi T+1)
Untuk mengisi kartu prediksi harga esok hari, gunakan data dari objek prediction.

Harga Aktual Terakhir: data.prediction.last_actual_close

Prediksi SVR Besok: data.prediction.SVR.predicted_close

Prediksi RF Besok: data.prediction.RandomForest.predicted_close

2. Komponen Feature Selection (Tabel & Grafik Batang)
Untuk merender halaman Feature Selection, looping (map) array dari data.feature_selection.ranking.

Gunakan properti name, score, dan rank untuk tabel.

Gunakan status === "selected" untuk menampilkan ikon centang (✅), dan dropped untuk ikon silang/minus (➖).

3. Komponen Evaluasi Model (Matriks Komparasi)
Untuk menampilkan tabel MAE, RMSE, dan R², langsung arahkan state ke data.metrics. Karena ada dua skenario (All_Features dan Selected_Features), sangat disarankan membuat tombol Tab di React untuk beralih antara nilai metrik seluruh fitur dan nilai metrik fitur terpilih.

4. Komponen Visualisasi (Grafik Garis)
Jika menggunakan pustaka seperti Recharts atau Chart.js, data di data.chart_data sudah berupa array yang memiliki panjang seragam (50 titik data terakhir).
Formatkan datanya di React sebelum dilempar ke komponen grafik:

JavaScript
const formattedChartData = data.chart_data.actual.map((act, index) => ({
  hari: `H-${50 - index}`,
  aktual: act,
  svr: data.chart_data.svr_selected[index],
  rf: data.chart_data.rf_selected[index]
}));