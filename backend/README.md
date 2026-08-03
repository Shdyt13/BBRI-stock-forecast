# Frontend Integration Guide

Dokumentasi integrasi frontend dengan **BBRI Stock Prediction Backend API**.

Backend menggunakan **FastAPI** dan frontend dapat berkomunikasi menggunakan HTTP request melalui **Axios** atau `fetch`.

---

## 1. Backend URL

### Development

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Simpan Base URL agar mudah digunakan:

```javascript
const API_BASE_URL = "http://localhost:8000";
```

---

# 2. Alur Integrasi

Frontend mengikuti alur berikut:

```text
User memilih CSV
      ↓
Frontend upload file
      ↓
POST /api/upload
      ↓
Upload berhasil
      ↓
POST /api/predict
      ↓
Backend melakukan:
├── Preprocessing
├── Time Series Split
├── Feature Selection
├── SVR Training
├── Random Forest Training
├── Hyperparameter Tuning
└── Evaluation
      ↓
Backend mengembalikan JSON
      ↓
Frontend menyimpan response
      ↓
Tampilkan Dashboard
├── Future Prediction
├── Feature Selection
├── Evaluation Metrics
└── Prediction Chart
```

---

# 3. Upload Dataset

## Endpoint

```http
POST /api/upload
```

### Request

Gunakan `multipart/form-data`.

```javascript
import axios from "axios";

const uploadDataset = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData
    );

    return response.data;
};
```

### File Input

```jsx
<input
    type="file"
    accept=".csv"
    onChange={(e) => setFile(e.target.files[0])}
/>
```

### Response

```json
{
    "message": "Dataset berhasil diunggah dan diproses!",
    "rows": 1000,
    "last_date": "2025-12-30"
}
```

### Frontend dapat menggunakan:

```javascript
const result = await uploadDataset(file);

console.log(result.rows);
console.log(result.last_date);
```

Contoh informasi yang dapat ditampilkan:

```text
Dataset uploaded successfully
Rows: 1000
Last Trading Date: 30 December 2025
```

---

# 4. Menjalankan Prediksi

Setelah upload berhasil, frontend dapat menjalankan prediction.

## Endpoint

```http
POST /api/predict
```

Tidak membutuhkan request body.

```javascript
const runPrediction = async () => {
    const response = await axios.post(
        `${API_BASE_URL}/api/predict`
    );

    return response.data;
};
```

Contoh penggunaan:

```javascript
const result = await runPrediction();

console.log(result);
```

---

# 5. Prediction Result

Response utama:

```json
{
    "message": "Prediksi 1 Hari Perdagangan Berikutnya Berhasil!",
    "prediction": {
        "base_date": "2025-12-30",
        "prediction_date": "2026-01-02",
        "last_actual_close": 3840.0,

        "SVR": {
            "predicted_log_return": 0.001,
            "predicted_close": 3843.84
        },

        "RandomForest": {
            "predicted_log_return": 0.002,
            "predicted_close": 3847.68
        }
    }
}
```

> Nilai di atas hanya contoh.

---

# 6. Menampilkan Future Prediction

Ambil object:

```javascript
const prediction = result.prediction;
```

### Tanggal

```javascript
const baseDate = prediction.base_date;
const predictionDate = prediction.prediction_date;
```

Tampilkan:

```jsx
<div>
    <p>Last Trading Date</p>
    <span>{prediction.base_date}</span>
</div>

<div>
    <p>Prediction Date</p>
    <span>{prediction.prediction_date}</span>
</div>
```

Untuk kasus dataset terakhir:

```text
Last Trading Date : 30 December 2025
Prediction Date   : 02 January 2026
```

**Frontend tidak perlu menghitung tanggal prediksi sendiri.**

Gunakan:

```javascript
prediction.prediction_date
```

---

# 7. Menampilkan Prediksi SVR

Data:

```javascript
const svr = result.prediction.SVR;
```

Akses:

```javascript
svr.predicted_log_return
svr.predicted_close
```

Contoh:

```jsx
<div>
    <h3>SVR Prediction</h3>

    <p>
        Log Return:
        {svr.predicted_log_return}
    </p>

    <p>
        Predicted Close:
        Rp {svr.predicted_close.toLocaleString("id-ID")}
    </p>
</div>
```

---

# 8. Menampilkan Prediksi Random Forest

Data:

```javascript
const randomForest =
    result.prediction.RandomForest;
```

Akses:

```javascript
randomForest.predicted_log_return
randomForest.predicted_close
```

Contoh:

```jsx
<div>
    <h3>Random Forest Prediction</h3>

    <p>
        Log Return:
        {randomForest.predicted_log_return}
    </p>

    <p>
        Predicted Close:
        Rp {randomForest.predicted_close.toLocaleString("id-ID")}
    </p>
</div>
```

---

# 9. Feature Selection

Data feature selection tersedia pada:

```javascript
const featureSelection =
    result.feature_selection;
```

### Selected Features

```javascript
featureSelection.selected_features
```

Contoh:

```javascript
[
    "Close",
    "Open",
    "High",
    "Volume"
]
```

### Ranking

```javascript
featureSelection.ranking
```

Contoh:

```json
[
    {
        "name": "Close",
        "score": 0.35,
        "rank": 1,
        "status": "selected"
    },
    {
        "name": "Open",
        "score": 0.25,
        "rank": 2,
        "status": "selected"
    }
]
```

### Contoh tabel

```jsx
<table>
    <thead>
        <tr>
            <th>Rank</th>
            <th>Feature</th>
            <th>Importance</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        {result.feature_selection.ranking.map(
            (feature) => (
                <tr key={feature.name}>
                    <td>{feature.rank}</td>
                    <td>{feature.name}</td>
                    <td>
                        {feature.score.toFixed(4)}
                    </td>
                    <td>{feature.status}</td>
                </tr>
            )
        )}
    </tbody>
</table>
```

---

# 10. Evaluation Metrics

Data tersedia pada:

```javascript
const metrics = result.metrics;
```

Struktur:

```text
metrics
├── All_Features
│   ├── SVR
│   └── RandomForest
│
└── Selected_Features
    ├── SVR
    └── RandomForest
```

Akses:

```javascript
metrics.All_Features.SVR.MAE
metrics.All_Features.SVR.RMSE
metrics.All_Features.SVR.R2

metrics.All_Features.RandomForest.MAE
metrics.All_Features.RandomForest.RMSE
metrics.All_Features.RandomForest.R2

metrics.Selected_Features.SVR.MAE
metrics.Selected_Features.SVR.RMSE
metrics.Selected_Features.SVR.R2

metrics.Selected_Features.RandomForest.MAE
metrics.Selected_Features.RandomForest.RMSE
metrics.Selected_Features.RandomForest.R2
```

### Contoh tabel frontend

```text
Scenario           Model           MAE      RMSE      R²
-----------------------------------------------------------
All Features       SVR             ...      ...       ...
All Features       Random Forest   ...      ...       ...
Selected Features  SVR             ...      ...       ...
Selected Features  Random Forest   ...      ...       ...
```

---

# 11. Chart Data

Data grafik tersedia pada:

```javascript
const chartData = result.chart_data;
```

Struktur:

```json
{
    "chart_data": {
        "actual": [],
        "svr_selected": [],
        "rf_selected": []
    }
}
```

Gunakan:

```javascript
chartData.actual
chartData.svr_selected
chartData.rf_selected
```

untuk membuat grafik perbandingan:

```text
Actual
vs
SVR Prediction
vs
Random Forest Prediction
```

Contoh jika menggunakan Chart.js:

```javascript
const data = {
    labels: chartLabels,

    datasets: [
        {
            label: "Actual",
            data: result.chart_data.actual
        },
        {
            label: "SVR",
            data: result.chart_data.svr_selected
        },
        {
            label: "Random Forest",
            data: result.chart_data.rf_selected
        }
    ]
};
```

---

# 12. Recommended React State

Frontend dapat menggunakan state seperti:

```javascript
const [file, setFile] = useState(null);
const [uploadResult, setUploadResult] = useState(null);
const [predictionResult, setPredictionResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

Flow:

```javascript
const handlePrediction = async () => {
    try {
        setLoading(true);
        setError(null);

        // Upload
        await uploadDataset(file);

        // Prediction
        const result = await runPrediction();

        setPredictionResult(result);

    } catch (error) {
        setError(
            error.response?.data?.error ||
            "Failed to process prediction"
        );
    } finally {
        setLoading(false);
    }
};
```

---

# 13. Recommended UI Flow

Frontend dapat menggunakan struktur:

```text
Dashboard
│
├── Dataset Upload
│   ├── Choose CSV
│   ├── Upload
│   └── Dataset Information
│
├── Prediction
│   ├── Last Trading Date
│   ├── Prediction Date
│   ├── Last Close
│   ├── SVR Prediction
│   └── Random Forest Prediction
│
├── Feature Selection
│   └── Feature Importance Table
│
├── Evaluation
│   └── Metrics Table
│
└── Chart
    ├── Actual
    ├── SVR
    └── Random Forest
```

---

# 14. Loading State

Proses `/api/predict` dapat membutuhkan waktu karena backend melakukan:

```text
GridSearchCV
+
TimeSeriesSplit
+
SVR Training
+
Random Forest Training
+
Feature Selection
```

Frontend sebaiknya menampilkan loading state:

```jsx
{loading && (
    <p>
        Processing dataset and training models...
    </p>
)}
```

Tombol prediction sebaiknya dinonaktifkan ketika proses berlangsung:

```jsx
<button
    disabled={loading || !file}
    onClick={handlePrediction}
>
    {loading
        ? "Processing..."
        : "Run Prediction"}
</button>
```

---

# 15. Error Handling

Backend dapat mengembalikan:

```json
{
    "error": "Dataset belum diunggah."
}
```

Frontend dapat menangani:

```javascript
try {
    const response = await axios.post(
        `${API_BASE_URL}/api/predict`
    );

    if (response.data.error) {
        throw new Error(response.data.error);
    }

} catch (error) {

    setError(
        error.response?.data?.error ||
        error.message ||
        "Something went wrong."
    );
}
```

---

# 16. Complete Integration Example

Contoh sederhana:

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const uploadDataset = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData
    );

    return response.data;
};


export const runPrediction = async () => {

    const response = await axios.post(
        `${API_BASE_URL}/api/predict`
    );

    return response.data;
};
```

Penggunaan:

```javascript
const handleRunPrediction = async () => {

    try {

        await uploadDataset(file);

        const result =
            await runPrediction();

        setPredictionResult(result);

    } catch (error) {

        console.error(error);

    }
};
```

---

# 17. Important Notes

1. Backend harus aktif sebelum frontend melakukan request.
2. Dataset harus di-upload melalui `/api/upload` sebelum `/api/predict`.
3. Frontend **tidak perlu melakukan preprocessing atau perhitungan machine learning**.
4. Frontend **tidak perlu menghitung `prediction_date` sendiri**.
5. Gunakan `prediction.prediction_date` dari response API.
6. Gunakan `prediction.SVR.predicted_close` untuk hasil prediksi SVR.
7. Gunakan `prediction.RandomForest.predicted_close` untuk hasil prediksi Random Forest.
8. Gunakan `feature_selection` untuk halaman Feature Selection.
9. Gunakan `metrics` untuk halaman Evaluation.
10. Gunakan `chart_data` untuk visualisasi hasil prediksi.

## API Summary

| Method | Endpoint       | Fungsi                          |
| ------ | -------------- | ------------------------------- |
| `POST` | `/api/upload`  | Upload & preprocessing dataset  |
| `POST` | `/api/predict` | Training, evaluasi & prediction |

### Base URL

```text
http://localhost:8000
```

### Development API Documentation

```text
http://localhost:8000/docs
```
