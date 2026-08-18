# BBRI Stock Prediction System

# Frontend Integration Documentation

Dokumentasi teknis integrasi Frontend dengan Backend API untuk sistem prediksi harga saham BBRI.

Dokumentasi ini ditujukan untuk developer frontend agar dapat mengintegrasikan aplikasi React/Vite dengan Backend FastAPI tanpa perlu memahami atau mengimplementasikan ulang proses Machine Learning di sisi frontend.

---

# 1. Overview

Sistem terdiri dari dua bagian utama:

```text
Frontend
React / Vite
    │
    │ HTTP Request
    ▼
Backend
FastAPI
    │
    ├── Dataset Processing
    ├── Feature Selection
    ├── SVR
    ├── Random Forest
    ├── Hyperparameter Tuning
    ├── Evaluation
    └── Future Prediction
```

Frontend hanya bertugas untuk:

```text
User Input
    ↓
Upload Dataset
    ↓
Request Prediction
    ↓
Receive JSON Response
    ↓
Process UI State
    ↓
Display Results
```

Frontend **tidak melakukan proses machine learning**.

---

# 2. Technology Stack

## Backend

Backend menggunakan:

```text
Python
FastAPI
Pandas
NumPy
Scikit-Learn
Uvicorn
```

## Frontend

Frontend dapat menggunakan:

```text
React
Vite
Axios / Fetch
Chart.js / Recharts
```

---

# 3. Backend Base URL

Pada development:

```text
http://localhost:8000
```

Sebaiknya frontend menyimpan URL dalam environment variable.

File:

```text
.env
```

Isi:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Kemudian:

```javascript
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;
```

Jangan menulis:

```javascript
axios.post("http://localhost:8000/api/predict");
```

berulang-ulang di component.

Gunakan:

```javascript
axios.post(
    `${API_BASE_URL}/api/predict`
);
```

---

# 4. Backend Documentation

FastAPI menyediakan Swagger UI:

```text
http://localhost:8000/docs
```

Swagger digunakan untuk:

* Melihat endpoint
* Melihat HTTP method
* Mencoba upload dataset
* Mencoba prediction
* Melihat response API
* Debugging integrasi

Redoc:

```text
http://localhost:8000/redoc
```

---

# 5. API Endpoint Overview

Backend saat ini menyediakan dua endpoint utama:

| Method | Endpoint       | Fungsi                                      |
| ------ | -------------- | ------------------------------------------- |
| POST   | `/api/upload`  | Upload dan preprocessing dataset            |
| POST   | `/api/predict` | Training, evaluation, dan future prediction |

Flow wajib:

```text
POST /api/upload
        ↓
Upload berhasil
        ↓
POST /api/predict
        ↓
Receive prediction result
```

Jangan menjalankan `/api/predict` sebelum dataset berhasil di-upload.

---

# 6. API Request Flow

Alur lengkap:

```text
┌──────────────────────────────┐
│ User memilih file CSV        │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Frontend validasi file       │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ POST /api/upload              │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Backend preprocessing        │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Upload response              │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ User menjalankan prediction  │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ POST /api/predict             │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Backend training + tuning    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Backend evaluation           │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Future prediction            │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ JSON response                │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Frontend render dashboard    │
└──────────────────────────────┘
```

---

# 7. Dataset Requirement

Frontend harus menyediakan input file CSV.

Backend mengharapkan fitur:

```text
Date
Open
High
Low
Close
Adj Close
Volume
```

Kolom fitur yang digunakan model:

```python
FEATURES = [
    "Open",
    "High",
    "Low",
    "Close",
    "Adj Close",
    "Volume"
]
```

Frontend **tidak perlu mengubah nama kolom** jika dataset sudah sesuai format.

---

# 8. Dataset Validation di Frontend

Sebelum upload, frontend disarankan melakukan validasi sederhana.

Validasi:

```text
File harus tersedia
↓
Extension harus .csv
↓
File tidak boleh kosong
↓
Jika memungkinkan, cek kolom wajib
```

Contoh:

```javascript
const REQUIRED_COLUMNS = [
    "Date",
    "Open",
    "High",
    "Low",
    "Close",
    "Adj Close",
    "Volume"
];
```

Frontend tidak perlu melakukan preprocessing nilai saham.

Preprocessing tetap dilakukan backend.

---

# 9. File Upload

## Endpoint

```http
POST /api/upload
```

## Content-Type

```text
multipart/form-data
```

## Request

Field:

```text
file
```

Contoh Axios:

```javascript
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000";

export const uploadDataset = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData
    );

    return response.data;
};
```

---

# 10. Upload Response

Backend mengembalikan:

```json
{
    "message": "Dataset berhasil diunggah dan diproses!",
    "rows": 1000,
    "last_date": "2025-12-30"
}
```

Field:

| Field       | Type   | Keterangan                                            |
| ----------- | ------ | ----------------------------------------------------- |
| `message`   | string | Informasi upload                                      |
| `rows`      | number | Jumlah baris setelah preprocessing/target preparation |
| `last_date` | string | Tanggal terakhir pada data yang diproses              |

Frontend dapat menyimpan response:

```javascript
const uploadResult =
    await uploadDataset(file);

setUploadResult(uploadResult);
```

---

# 11. Upload UI

Setelah upload berhasil, frontend dapat menampilkan:

```text
Dataset Information

Status:
Uploaded successfully

Rows:
1000

Last Trading Date:
30 December 2025
```

Contoh:

```jsx
<div>
    <h3>Dataset Information</h3>

    <p>
        Rows: {uploadResult?.rows}
    </p>

    <p>
        Last Trading Date: {
            uploadResult?.last_date
        }
    </p>
</div>
```

---

# 12. Prediction Endpoint

## Endpoint

```http
POST /api/predict
```

Endpoint ini tidak membutuhkan request body.

```javascript
export const runPrediction = async () => {

    const response = await axios.post(
        `${API_BASE_URL}/api/predict`
    );

    return response.data;
};
```

---

# 13. Apa yang Dilakukan Backend Saat `/api/predict`

Frontend perlu mengetahui bahwa endpoint ini bukan sekadar mengambil data.

Backend melakukan:

```text
Dataset
    ↓
Load processed data
    ↓
Remove row without target
    ↓
80:20 chronological split
    ↓
MinMaxScaler
    ↓
All Features
    ↓
SVR + GridSearchCV
    ↓
Random Forest + GridSearchCV
    ↓
Feature Selection
    ↓
Selected Features
    ↓
SVR + GridSearchCV
    ↓
Random Forest + GridSearchCV
    ↓
Evaluation
    ↓
Future Prediction
    ↓
JSON Response
```

Karena proses tersebut cukup berat, frontend harus menyediakan loading state.

---

# 14. Prediction Response Structure

Response `/api/predict` memiliki struktur:

```text
response
│
├── message
│
├── prediction
│   ├── base_date
│   ├── prediction_date
│   ├── last_actual_close
│   │
│   ├── SVR
│   │   ├── predicted_log_return
│   │   └── predicted_close
│   │
│   └── RandomForest
│       ├── predicted_log_return
│       └── predicted_close
│
├── feature_selection
│   ├── selected_features
│   └── ranking
│
├── metrics
│   ├── All_Features
│   └── Selected_Features
│
└── chart_data
    ├── actual
    ├── svr_selected
    └── rf_selected
```

Ini adalah struktur penting yang harus dipahami developer frontend.

---

# 15. Full Example Response

Contoh:

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
    },

    "feature_selection": {
        "selected_features": [
            "Close",
            "Open",
            "High",
            "Volume"
        ],

        "ranking": [
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
    },

    "metrics": {
        "All_Features": {
            "SVR": {
                "MAE": 0.01,
                "RMSE": 0.02,
                "R2": 0.80
            },

            "RandomForest": {
                "MAE": 0.01,
                "RMSE": 0.02,
                "R2": 0.82
            }
        },

        "Selected_Features": {
            "SVR": {
                "MAE": 0.01,
                "RMSE": 0.02,
                "R2": 0.81
            },

            "RandomForest": {
                "MAE": 0.01,
                "RMSE": 0.02,
                "R2": 0.84
            }
        }
    },

    "chart_data": {
        "actual": [],
        "svr_selected": [],
        "rf_selected": []
    }
}
```

Nilai di atas hanya contoh struktur response.

---

# 16. Prediction Date Logic

Ini merupakan bagian penting.

Dataset terakhir:

```text
30 December 2025
```

Pasar tidak memiliki data:

```text
31 December 2025
01 January 2026
```

Karena itu tanggal perdagangan berikutnya adalah:

```text
02 January 2026
```

Backend saat ini mengembalikan:

```json
{
    "base_date": "2025-12-30",
    "prediction_date": "2026-01-02"
}
```

Frontend harus menampilkan:

```text
Last Trading Date
30 December 2025

Prediction Date
02 January 2026
```

## Sangat penting

Frontend **tidak boleh menghitung tanggal tersebut sendiri**.

Jangan:

```javascript
const predictionDate =
    addOneDay(baseDate);
```

Jangan:

```javascript
new Date(baseDate)
```

untuk menentukan tanggal prediction.

Gunakan:

```javascript
result.prediction.prediction_date
```

Tujuannya agar business logic tanggal tetap berada di backend.

---

# 17. Base Date vs Prediction Date

Frontend harus membedakan kedua field berikut.

## `base_date`

Merupakan tanggal terakhir data aktual yang digunakan sebagai dasar prediksi.

Contoh:

```text
2025-12-30
```

## `prediction_date`

Merupakan tanggal yang diprediksi.

Contoh:

```text
2026-01-02
```

Visual:

```text
Historical Data
        ↓
30 Dec 2025
        │
        │ Model Prediction
        ↓
02 Jan 2026
```

---

# 18. Future Prediction

Object:

```javascript
const prediction =
    result.prediction;
```

Field:

```javascript
prediction.base_date
prediction.prediction_date
prediction.last_actual_close
```

Contoh:

```jsx
<div>
    <span>Last Trading Date</span>
    <strong>
        {prediction.base_date}
    </strong>
</div>

<div>
    <span>Prediction Date</span>
    <strong>
        {prediction.prediction_date}
    </strong>
</div>

<div>
    <span>Last Actual Close</span>
    <strong>
        {prediction.last_actual_close}
    </strong>
</div>
```

---

# 19. SVR Prediction

Access:

```javascript
const svr =
    result.prediction.SVR;
```

Field:

```javascript
svr.predicted_log_return
svr.predicted_close
```

Contoh:

```jsx
<div>
    <h3>SVR</h3>

    <p>
        Predicted Log Return:
        {svr.predicted_log_return}
    </p>

    <p>
        Predicted Close:
        {formatRupiah(
            svr.predicted_close
        )}
    </p>
</div>
```

---

# 20. Random Forest Prediction

Access:

```javascript
const rf =
    result.prediction.RandomForest;
```

Field:

```javascript
rf.predicted_log_return
rf.predicted_close
```

Contoh:

```jsx
<div>
    <h3>Random Forest</h3>

    <p>
        Predicted Log Return:
        {rf.predicted_log_return}
    </p>

    <p>
        Predicted Close:
        {formatRupiah(
            rf.predicted_close
        )}
    </p>
</div>
```

---

# 21. Formatting Harga Rupiah

Backend mengembalikan numeric value.

Frontend bertanggung jawab untuk formatting.

Gunakan utility:

```javascript
export const formatRupiah = (value) => {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "-";
    }

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 2
        }
    ).format(value);
};
```

Contoh:

```javascript
formatRupiah(3843.84);
```

Hasil:

```text
Rp3.843,84
```

---

# 22. Formatting Date

Backend memberikan ISO-like date:

```text
2026-01-02
```

Frontend dapat mengubah format hanya untuk display.

Contoh:

```javascript
export const formatDate = (date) => {

    if (!date) return "-";

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        new Date(`${date}T00:00:00`)
    );
};
```

Hasil:

```text
02 January 2026
```

Penting:

```text
Formatting date ≠ menentukan prediction date
```

Frontend hanya mengubah tampilan.

---

# 23. Feature Selection

Backend melakukan Feature Selection menggunakan Random Forest Feature Importance.

Frontend menerima hasilnya.

Access:

```javascript
const featureSelection =
    result.feature_selection;
```

---

# 24. Selected Features

Access:

```javascript
featureSelection.selected_features
```

Contoh:

```json
[
    "Close",
    "Open",
    "High",
    "Volume"
]
```

Frontend dapat menampilkan:

```text
Selected Features

Close
Open
High
Volume
```

---

# 25. Feature Ranking

Access:

```javascript
featureSelection.ranking
```

Setiap item memiliki:

```text
name
score
rank
status
```

Contoh:

```json
{
    "name": "Close",
    "score": 0.35,
    "rank": 1,
    "status": "selected"
}
```

---

# 26. Feature Selection Table

Recommended:

| Rank | Feature   | Importance | Status   |
| ---: | --------- | ---------: | -------- |
|    1 | Close     |     0.3500 | Selected |
|    2 | Open      |     0.2500 | Selected |
|    3 | High      |     0.1800 | Selected |
|    4 | Volume    |     0.1200 | Selected |
|    5 | Low       |     0.0600 | Dropped  |
|    6 | Adj Close |     0.0400 | Dropped  |

Nilai hanya contoh.

React:

```jsx
<tbody>
    {result.feature_selection.ranking.map(
        (feature) => (
            <tr key={feature.name}>
                <td>{feature.rank}</td>

                <td>{feature.name}</td>

                <td>
                    {feature.score.toFixed(4)}
                </td>

                <td>
                    {feature.status}
                </td>
            </tr>
        )
    )}
</tbody>
```

---

# 27. Evaluation Metrics

Backend menghasilkan evaluasi untuk dua skenario:

```text
All Features
Selected Features
```

Masing-masing memiliki:

```text
SVR
Random Forest
```

Setiap model memiliki:

```text
MAE
RMSE
R2
```

---

# 28. Metrics Structure

```text
metrics
│
├── All_Features
│   │
│   ├── SVR
│   │   ├── MAE
│   │   ├── RMSE
│   │   └── R2
│   │
│   └── RandomForest
│       ├── MAE
│       ├── RMSE
│       └── R2
│
└── Selected_Features
    │
    ├── SVR
    │   ├── MAE
    │   ├── RMSE
    │   └── R2
    │
    └── RandomForest
        ├── MAE
        ├── RMSE
        └── R2
```

---

# 29. Access Metrics

All Features:

```javascript
result.metrics.All_Features.SVR.MAE

result.metrics.All_Features.SVR.RMSE

result.metrics.All_Features.SVR.R2
```

Random Forest:

```javascript
result.metrics.All_Features.RandomForest.MAE

result.metrics.All_Features.RandomForest.RMSE

result.metrics.All_Features.RandomForest.R2
```

Selected Features:

```javascript
result.metrics.Selected_Features.SVR.MAE

result.metrics.Selected_Features.SVR.RMSE

result.metrics.Selected_Features.SVR.R2
```

Random Forest:

```javascript
result.metrics.Selected_Features.RandomForest.MAE

result.metrics.Selected_Features.RandomForest.RMSE

result.metrics.Selected_Features.RandomForest.R2
```

---

# 30. Evaluation Table

Recommended UI:

```text
Evaluation Results

┌────────────────────┬────────────────┬─────────┬─────────┬────────┐
│ Scenario           │ Model          │ MAE     │ RMSE    │ R²     │
├────────────────────┼────────────────┼─────────┼─────────┼────────┤
│ All Features       │ SVR            │ ...     │ ...     │ ...    │
│ All Features       │ Random Forest  │ ...     │ ...     │ ...    │
│ Selected Features  │ SVR            │ ...     │ ...     │ ...    │
│ Selected Features  │ Random Forest  │ ...     │ ...     │ ...    │
└────────────────────┴────────────────┴─────────┴─────────┴────────┘
```

Frontend tidak perlu menghitung:

```text
MAE
RMSE
R²
```

Backend sudah menghitungnya.

---

# 31. Chart Data

Backend menyediakan:

```javascript
result.chart_data
```

Struktur:

```javascript
{
    actual: [],
    svr_selected: [],
    rf_selected: []
}
```

Access:

```javascript
const chartData =
    result.chart_data;
```

---

# 32. Chart Meaning

Data:

```text
actual
```

merupakan nilai aktual target pada test set.

```text
svr_selected
```

merupakan prediksi SVR menggunakan selected features.

```text
rf_selected
```

merupakan prediksi Random Forest menggunakan selected features.

Frontend dapat membuat grafik:

```text
Actual
    vs
SVR
    vs
Random Forest
```

---

# 33. Chart.js Example

Jika menggunakan Chart.js:

```javascript
const chartData = {
    labels: labels,

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

Frontend dapat menggunakan:

```text
react-chartjs-2
```

atau library chart lainnya.

---

# 34. Chart Labels

Perhatian:

Backend saat ini mengembalikan array:

```text
actual
svr_selected
rf_selected
```

tetapi tidak mengembalikan array tanggal untuk setiap titik chart.

Oleh karena itu frontend **tidak boleh mengklaim bahwa index tertentu pasti mewakili tanggal tertentu**, kecuali frontend memiliki sumber tanggal yang sesuai.

Untuk kebutuhan chart yang akurat secara tanggal, backend idealnya pada tahap berikutnya dapat mengembalikan:

```json
{
    "dates": [],
    "actual": [],
    "svr_selected": [],
    "rf_selected": []
}
```

Namun struktur backend saat ini tetap dapat digunakan untuk chart berbasis index.

---

# 35. Loading State

Endpoint `/api/predict` melakukan training dan GridSearchCV.

Karena itu frontend wajib memiliki:

```javascript
const [loading, setLoading] =
    useState(false);
```

Ketika prediction dimulai:

```javascript
setLoading(true);
```

Setelah selesai:

```javascript
setLoading(false);
```

Gunakan:

```jsx
<button
    disabled={loading || !file}
    onClick={handleRunPrediction}
>
    {loading
        ? "Processing..."
        : "Run Prediction"}
</button>
```

---

# 36. Loading UX

Disarankan menampilkan:

```text
Processing dataset...

Training SVR
Training Random Forest
Running evaluation
Generating prediction
```

Jika backend belum memberikan progress endpoint, teks tersebut hanya boleh dianggap sebagai **loading indicator umum**, bukan progress aktual.

Jangan menampilkan:

```text
SVR 50% complete
```

karena backend saat ini tidak mengirimkan progress tersebut.

---

# 37. Error Handling

Backend dapat mengembalikan:

```json
{
    "error": "Dataset belum diunggah."
}
```

Frontend harus membaca:

```javascript
error.response?.data?.error
```

Contoh:

```javascript
try {

    const result =
        await runPrediction();

} catch (error) {

    const message =
        error.response?.data?.error ||
        error.message ||
        "Something went wrong.";

    setError(message);
}
```

Display:

```jsx
{error && (
    <div className="error-message">
        {error}
    </div>
)}
```

---

# 38. State yang Disarankan

Dashboard:

```javascript
const [file, setFile] =
    useState(null);

const [uploadResult, setUploadResult] =
    useState(null);

const [predictionResult, setPredictionResult] =
    useState(null);

const [loading, setLoading] =
    useState(false);

const [error, setError] =
    useState(null);
```

State flow:

```text
file
 ↓
uploadResult
 ↓
predictionResult
 ↓
UI
```

---

# 39. Complete Prediction Handler

```javascript
const handleRunPrediction = async () => {

    if (!file) {
        setError(
            "Please select a CSV file first."
        );
        return;
    }

    try {

        setLoading(true);
        setError(null);

        // Upload dataset
        const upload =
            await uploadDataset(file);

        setUploadResult(upload);

        // Run prediction
        const result =
            await runPrediction();

        setPredictionResult(result);

    } catch (error) {

        setError(
            error.response?.data?.error ||
            error.message ||
            "Failed to process dataset."
        );

    } finally {

        setLoading(false);
    }
};
```

---

# 40. Recommended Frontend Architecture

Struktur:

```text
src/
│
├── components/
│   ├── DatasetUpload.jsx
│   ├── DatasetInfo.jsx
│   ├── PredictionSummary.jsx
│   ├── ModelPredictionCard.jsx
│   ├── FeatureSelectionTable.jsx
│   ├── EvaluationTable.jsx
│   ├── PredictionChart.jsx
│   ├── LoadingState.jsx
│   └── ErrorMessage.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── FeatureSelection.jsx
│   └── Evaluation.jsx
│
├── services/
│   └── api.js
│
├── utils/
│   ├── formatter.js
│   └── validators.js
│
├── App.jsx
└── main.jsx
```

---

# 41. API Service Layer

Semua komunikasi API sebaiknya berada pada:

```text
src/services/api.js
```

Contoh:

```javascript
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL
});

export const uploadDataset = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response =
        await api.post(
            "/api/upload",
            formData
        );

    return response.data;
};

export const runPrediction = async () => {

    const response =
        await api.post(
            "/api/predict"
        );

    return response.data;
};
```

Dengan ini component tidak perlu mengetahui URL backend.

---

# 42. Recommended Components

## DatasetUpload

Tanggung jawab:

```text
File selection
File validation
Upload trigger
```

Tidak menangani machine learning.

---

## DatasetInfo

Menampilkan:

```text
Rows
Last Trading Date
Upload status
```

---

## PredictionSummary

Menampilkan:

```text
Base Date
Prediction Date
Last Actual Close
```

---

## ModelPredictionCard

Menampilkan:

```text
Model
Log Return
Predicted Close
```

Digunakan untuk:

```text
SVR
Random Forest
```

---

## FeatureSelectionTable

Menampilkan:

```text
Rank
Feature
Importance
Status
```

---

## EvaluationTable

Menampilkan:

```text
Scenario
Model
MAE
RMSE
R²
```

---

## PredictionChart

Menampilkan:

```text
Actual
SVR
Random Forest
```

---

# 43. Recommended Dashboard Layout

```text
Dashboard
│
├── Dataset Upload
│
├── Dataset Information
│   ├── Rows
│   └── Last Trading Date
│
├── Future Prediction
│   ├── Base Date
│   ├── Prediction Date
│   └── Last Actual Close
│
├── Model Predictions
│   ├── SVR
│   └── Random Forest
│
├── Prediction Chart
│
├── Feature Selection
│   └── Feature Ranking
│
└── Evaluation
    └── Metrics Comparison
```

---

# 44. Recommended User Flow

User:

```text
1. Open Dashboard
        ↓
2. Select CSV
        ↓
3. Click Run Prediction
        ↓
4. Frontend upload dataset
        ↓
5. Backend preprocessing
        ↓
6. Frontend receives upload response
        ↓
7. Frontend request /api/predict
        ↓
8. Show loading
        ↓
9. Backend training + evaluation
        ↓
10. Backend returns result
        ↓
11. Frontend stores result
        ↓
12. Render Dashboard
```

---

# 45. Important: Jangan Melakukan Duplicate Logic

Frontend tidak boleh mengulang logic backend seperti:

```text
MinMaxScaler
Log Return
Random Forest Feature Importance
TimeSeriesSplit
GridSearchCV
SVR Training
Random Forest Training
MAE
RMSE
R²
Predicted Log Return → Price
```

Semua proses tersebut sudah dilakukan backend.

Frontend hanya menampilkan hasil.

---

# 46. Prediction Price

Backend sudah melakukan:

```text
Predicted Log Return
        ↓
exp(Log Return)
        ↓
Last Actual Close × exp(Log Return)
        ↓
Predicted Close
```

Frontend tidak perlu mengulang perhitungan tersebut.

Gunakan langsung:

```javascript
result.prediction.SVR.predicted_close
```

dan:

```javascript
result.prediction.RandomForest.predicted_close
```

---

# 47. Jangan Mengubah Nilai Metrics

Jika backend memberikan:

```json
{
    "MAE": 123.45,
    "RMSE": 150.20,
    "R2": 0.82
}
```

frontend hanya melakukan formatting display.

Jangan menghitung ulang.

Contoh:

```javascript
metric.MAE.toFixed(4)
```

boleh.

Tetapi:

```javascript
calculateMAE(...)
```

tidak diperlukan.

---

# 48. Scenario Handling

Frontend perlu membedakan dua scenario:

```text
All Features
```

dan:

```text
Selected Features
```

Contoh tab:

```text
[ All Features ] [ Selected Features ]
```

Kemudian masing-masing menampilkan:

```text
SVR
Random Forest
```

---

# 49. Suggested Evaluation UI

Contoh:

```text
Evaluation

[ All Features ] [ Selected Features ]

Model:
┌────────────────────────────────┐
│ SVR                            │
│                                │
│ MAE   : ...                    │
│ RMSE  : ...                    │
│ R²    : ...                    │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Random Forest                  │
│                                │
│ MAE   : ...                    │
│ RMSE  : ...                    │
│ R²    : ...                    │
└────────────────────────────────┘
```

---

# 50. Feature Selection UI

Recommended:

```text
Feature Selection

Selected Features
────────────────────────
Close
Open
High
Volume

Feature Importance
──────────────────────────────────────
Rank | Feature | Score | Status
1    | Close   | 0.xxx | Selected
2    | Open    | 0.xxx | Selected
3    | High    | 0.xxx | Selected
...
```

---

# 51. Future Prediction UI

Recommended:

```text
Future Prediction

Last Trading Date
30 December 2025

Prediction Date
02 January 2026

Last Actual Close
Rp3.840

────────────────────────

SVR
Predicted Close
Rp3.8xx

Random Forest
Predicted Close
Rp3.8xx
```

---

# 52. Important Date Rule

Jangan tampilkan:

```text
Prediction Date: 31 December 2025
```

jika backend response:

```json
"prediction_date": "2026-01-02"
```

Frontend harus mengikuti:

```javascript
prediction.prediction_date
```

Bukan membuat tanggal berdasarkan:

```javascript
base_date + 1 day
```

---

# 53. Backend vs Frontend Responsibility

## Backend

```text
Dataset processing
Data cleaning
Log Return
Target creation
Feature scaling
Feature selection
Model training
Hyperparameter tuning
Prediction
Evaluation
Prediction date
```

## Frontend

```text
File selection
Input validation
API request
Loading state
Error state
Response state
Date formatting
Currency formatting
Tables
Cards
Charts
Navigation
```

---

# 54. API Contract

Frontend dapat menganggap API contract berikut sebagai sumber utama.

## Upload

```text
POST /api/upload
```

Input:

```text
file: CSV
```

Output:

```text
message
rows
last_date
```

## Prediction

```text
POST /api/predict
```

Output:

```text
message

prediction
├── base_date
├── prediction_date
├── last_actual_close
├── SVR
└── RandomForest

feature_selection
├── selected_features
└── ranking

metrics
├── All_Features
└── Selected_Features

chart_data
├── actual
├── svr_selected
└── rf_selected
```

---

# 55. Error State

Frontend minimal harus memiliki tiga kondisi:

```text
IDLE
LOADING
SUCCESS
ERROR
```

Contoh:

```text
IDLE
↓
User pilih file

LOADING
↓
Backend sedang processing

SUCCESS
↓
Result ditampilkan

ERROR
↓
Error message ditampilkan
```

---

# 56. Disable Button

Saat loading:

```jsx
<button disabled={loading}>
    {loading
        ? "Processing..."
        : "Run Prediction"}
</button>
```

Tujuannya mencegah user mengirim beberapa request `/api/predict` secara bersamaan.

---

# 57. Empty State

Sebelum prediction:

```text
No prediction result yet.

Upload a dataset and run prediction
to see the results.
```

Feature selection:

```text
No feature selection data available.
```

Evaluation:

```text
No evaluation results available.
```

Chart:

```text
No prediction data available.
```

---

# 58. Defensive Rendering

Jangan langsung:

```javascript
result.prediction.SVR.predicted_close
```

jika `result` belum tersedia.

Gunakan conditional rendering:

```jsx
{predictionResult && (
    <PredictionSummary
        data={predictionResult.prediction}
    />
)}
```

Atau optional chaining:

```javascript
predictionResult?.prediction?.SVR?.predicted_close
```

---

# 59. Response Storage

Disarankan menyimpan seluruh response prediction:

```javascript
const [predictionResult, setPredictionResult] =
    useState(null);
```

Jangan langsung memecah response menjadi terlalu banyak state jika tidak diperlukan.

Misalnya cukup:

```javascript
setPredictionResult(result);
```

Kemudian component membaca:

```javascript
predictionResult.prediction
predictionResult.feature_selection
predictionResult.metrics
predictionResult.chart_data
```

---

# 60. Axios Interceptor

Jika frontend menggunakan Axios, interceptor opsional dapat digunakan untuk error handling global.

Contoh:

```javascript
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000
});
```

Timeout dapat disesuaikan karena proses training dapat lebih lama daripada request API biasa.

---

# 61. CORS

Backend saat ini menggunakan:

```python
allow_origins=["*"]
```

Artinya frontend development dapat melakukan request ke backend.

Contoh:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000
```

Tetap dapat berkomunikasi karena CORS backend sudah dikonfigurasi.

Untuk production, sebaiknya `allow_origins` dibatasi ke domain frontend yang sebenarnya.

---

# 62. Environment Configuration

Development:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Production misalnya:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Frontend tidak perlu mengubah source code component.

---

# 63. Jangan Hardcode Backend URL

Hindari:

```javascript
fetch(
    "http://localhost:8000/api/predict"
);
```

Gunakan:

```javascript
fetch(
    `${API_BASE_URL}/api/predict`
);
```

Ini penting ketika backend nanti dipindahkan ke server deployment.

---

# 64. Complete API Service Example

File:

```text
src/services/api.js
```

Isi:

```javascript
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000
});


export const uploadDataset = async (file) => {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    const response =
        await api.post(
            "/api/upload",
            formData
        );

    return response.data;
};


export const runPrediction = async () => {

    const response =
        await api.post(
            "/api/predict"
        );

    return response.data;
};


export default api;
```

---

# 65. Complete Dashboard Example

Pseudo implementation:

```jsx
const Dashboard = () => {

    const [file, setFile] =
        useState(null);

    const [uploadResult, setUploadResult] =
        useState(null);

    const [predictionResult, setPredictionResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    const handleRunPrediction = async () => {

        if (!file) {
            setError(
                "Please select a CSV file."
            );
            return;
        }

        try {

            setLoading(true);
            setError(null);

            const upload =
                await uploadDataset(file);

            setUploadResult(upload);

            const prediction =
                await runPrediction();

            setPredictionResult(
                prediction
            );

        } catch (error) {

            setError(
                error.response?.data?.error ||
                error.message ||
                "Prediction failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div>

            <DatasetUpload
                file={file}
                setFile={setFile}
            />

            <button
                disabled={
                    loading ||
                    !file
                }
                onClick={
                    handleRunPrediction
                }
            >
                {loading
                    ? "Processing..."
                    : "Run Prediction"}
            </button>


            {error && (
                <ErrorMessage
                    message={error}
                />
            )}


            {uploadResult && (
                <DatasetInfo
                    data={uploadResult}
                />
            )}


            {predictionResult && (
                <>
                    <PredictionSummary
                        data={
                            predictionResult.prediction
                        }
                    />

                    <PredictionChart
                        data={
                            predictionResult.chart_data
                        }
                    />

                    <FeatureSelectionTable
                        data={
                            predictionResult
                                .feature_selection
                        }
                    />

                    <EvaluationTable
                        data={
                            predictionResult.metrics
                        }
                    />
                </>
            )}

        </div>
    );
};
```

---

# 66. Recommended UI Data Mapping

| UI Component      | API Source                                     |
| ----------------- | ---------------------------------------------- |
| Upload status     | `uploadResult.message`                         |
| Dataset rows      | `uploadResult.rows`                            |
| Last trading date | `uploadResult.last_date`                       |
| Base date         | `prediction.base_date`                         |
| Prediction date   | `prediction.prediction_date`                   |
| Last close        | `prediction.last_actual_close`                 |
| SVR log return    | `prediction.SVR.predicted_log_return`          |
| SVR price         | `prediction.SVR.predicted_close`               |
| RF log return     | `prediction.RandomForest.predicted_log_return` |
| RF price          | `prediction.RandomForest.predicted_close`      |
| Selected features | `feature_selection.selected_features`          |
| Feature ranking   | `feature_selection.ranking`                    |
| Evaluation        | `metrics`                                      |
| Actual chart      | `chart_data.actual`                            |
| SVR chart         | `chart_data.svr_selected`                      |
| RF chart          | `chart_data.rf_selected`                       |

---

# 67. Data Flow per UI Section

## Dataset

```text
/api/upload
    ↓
uploadResult
    ↓
DatasetInfo
```

## Future Prediction

```text
/api/predict
    ↓
prediction
    ↓
PredictionSummary
```

## Feature Selection

```text
/api/predict
    ↓
feature_selection
    ↓
FeatureSelectionTable
```

## Evaluation

```text
/api/predict
    ↓
metrics
    ↓
EvaluationTable
```

## Chart

```text
/api/predict
    ↓
chart_data
    ↓
PredictionChart
```

---

# 68. Things Frontend Must NOT Do

Frontend jangan:

```text
❌ Training SVR
❌ Training Random Forest
❌ GridSearchCV
❌ TimeSeriesSplit
❌ Random Forest Feature Importance
❌ MinMaxScaler
❌ Menghitung Log Return
❌ Menghitung MAE
❌ Menghitung RMSE
❌ Menghitung R²
❌ Menghitung predicted close
❌ Menentukan prediction date
❌ Mengubah hasil backend
```

Frontend hanya:

```text
✅ Upload
✅ Request
✅ Receive
✅ Format
✅ Display
```

---

# 69. Things Frontend May Do

Frontend boleh melakukan:

```text
✓ Format tanggal
✓ Format Rupiah
✓ Membulatkan angka untuk display
✓ Membuat chart
✓ Membuat table
✓ Sorting tampilan
✓ Filtering tampilan
✓ Loading indicator
✓ Error message
✓ Responsive layout
✓ Navigation
```

Namun jangan mengubah nilai asli yang digunakan sebagai data penelitian.

---

# 70. Testing Checklist

Sebelum integrasi dianggap selesai, lakukan testing berikut.

## Backend Connection

```text
[ ] Backend berjalan
[ ] http://localhost:8000/docs dapat dibuka
[ ] Frontend dapat mengakses backend
```

## Upload

```text
[ ] File CSV dapat dipilih
[ ] File non-CSV ditolak
[ ] Dataset dapat di-upload
[ ] Upload response diterima
[ ] Rows ditampilkan
[ ] Last date ditampilkan
```

## Prediction

```text
[ ] Prediction button dapat digunakan
[ ] Loading muncul
[ ] Button disabled ketika loading
[ ] Prediction response diterima
[ ] Error dapat ditampilkan
```

## Future Prediction

```text
[ ] Base date tampil
[ ] Prediction date tampil
[ ] Last close tampil
[ ] SVR predicted close tampil
[ ] Random Forest predicted close tampil
```

## Feature Selection

```text
[ ] Selected features tampil
[ ] Ranking tampil
[ ] Score tampil
[ ] Status tampil
```

## Evaluation

```text
[ ] All Features tampil
[ ] Selected Features tampil
[ ] SVR tampil
[ ] Random Forest tampil
[ ] MAE tampil
[ ] RMSE tampil
[ ] R² tampil
```

## Chart

```text
[ ] Actual tampil
[ ] SVR tampil
[ ] Random Forest tampil
[ ] Chart tidak error jika data kosong
```

---

# 71. Integration Checklist

Developer frontend dapat menggunakan checklist berikut:

```text
ENVIRONMENT
[ ] .env dibuat
[ ] VITE_API_BASE_URL dikonfigurasi

API
[ ] api.js dibuat
[ ] Axios dikonfigurasi
[ ] /api/upload terhubung
[ ] /api/predict terhubung

UPLOAD
[ ] CSV input tersedia
[ ] FormData digunakan
[ ] file dikirim dengan key "file"
[ ] Upload response disimpan

PREDICTION
[ ] Prediction request berhasil
[ ] Loading state tersedia
[ ] Error handling tersedia
[ ] Response disimpan

PREDICTION DISPLAY
[ ] base_date
[ ] prediction_date
[ ] last_actual_close
[ ] SVR prediction
[ ] Random Forest prediction

FEATURE SELECTION
[ ] selected_features
[ ] ranking
[ ] score
[ ] status

EVALUATION
[ ] All Features
[ ] Selected Features
[ ] SVR
[ ] Random Forest
[ ] MAE
[ ] RMSE
[ ] R²

CHART
[ ] Actual
[ ] SVR
[ ] Random Forest

UX
[ ] Loading
[ ] Error
[ ] Empty state
[ ] Button disabled
[ ] Responsive layout
```

---

# 72. Expected Final Frontend

Secara konseptual, frontend diharapkan menghasilkan:

```text
┌──────────────────────────────────────────────────┐
│              BBRI STOCK PREDICTION               │
├──────────────────────────────────────────────────┤
│                                                  │
│ Dataset Upload                                   │
│ [ Choose CSV ]       [ Run Prediction ]          │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Dataset Information                              │
│ Rows              : 2,192                       │
│ Last Trading Date : 30 December 2025            │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Future Prediction                                │
│                                                  │
│ Base Date         : 30 December 2025            │
│ Prediction Date   : 02 January 2026             │
│ Last Close        : Rp xxx                      │
│                                                  │
│ ┌────────────────────┐ ┌────────────────────┐   │
│ │ SVR                │ │ Random Forest      │   │
│ │                    │ │                    │   │
│ │ Log Return: xxx    │ │ Log Return: xxx    │   │
│ │ Close: Rp xxx      │ │ Close: Rp xxx      │   │
│ └────────────────────┘ └────────────────────┘   │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Prediction Chart                                 │
│                                                  │
│ Actual ───────────────────────────────           │
│ SVR    ───────────────────────────────           │
│ RF     ───────────────────────────────           │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Feature Selection                                │
│                                                  │
│ Feature       Importance    Rank     Status      │
│ Close         xxx           1        Selected    │
│ Open          xxx           2        Selected    │
│ High          xxx           3        Selected    │
│ ...                                              │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Evaluation                                       │
│                                                  │
│ Scenario          Model          MAE RMSE R²     │
│ All Features      SVR            ... ... ...     │
│ All Features      Random Forest  ... ... ...     │
│ Selected Features SVR            ... ... ...     │
│ Selected Features Random Forest  ... ... ...     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

# 73. Important Backend Contract

Untuk integrasi saat ini, frontend harus mengikuti struktur backend berikut:

```text
POST /api/upload
```

menghasilkan:

```text
message
rows
last_date
```

Kemudian:

```text
POST /api/predict
```

menghasilkan:

```text
message
prediction
feature_selection
metrics
chart_data
```

Jangan mengasumsikan field lain yang tidak tercantum dalam dokumentasi ini.

---

# 74. Final Integration Rule

Prinsip integrasi:

```text
                 BACKEND
                    │
                    │
        ┌───────────┴───────────┐
        │                       │
   ML Processing           API Response
        │                       │
        │                       ▼
        │                  FRONTEND
        │                       │
        │             ┌─────────┴─────────┐
        │             │                   │
        │          Formatting          UI/Chart
        │             │                   │
        └─────────────┴───────────────────┘
```

Backend adalah **source of truth** untuk hasil machine learning.

Frontend adalah **presentation layer**.

Jadi:

```text
Backend:
"Calculate"

Frontend:
"Display"
```

Frontend tidak boleh mengubah logika penelitian yang telah diterapkan pada backend.

---

# 75. Quick Reference

## Backend

```text
http://localhost:8000
```

## Swagger

```text
http://localhost:8000/docs
```

## Upload

```http
POST /api/upload
```

Request:

```text
multipart/form-data
file=<CSV>
```

## Prediction

```http
POST /api/predict
```

Body:

```text
None
```

## Prediction Date

```javascript
result.prediction.prediction_date
```

## SVR Price

```javascript
result.prediction.SVR.predicted_close
```

## Random Forest Price

```javascript
result.prediction.RandomForest.predicted_close
```

## Selected Features

```javascript
result.feature_selection.selected_features
```

## Feature Ranking

```javascript
result.feature_selection.ranking
```

## Metrics

```javascript
result.metrics
```

## Chart

```javascript
result.chart_data
```

---

# 76. Kesimpulan

Integrasi frontend dengan backend dilakukan melalui dua tahap utama:

```text
1. UPLOAD
POST /api/upload

        ↓

2. PREDICTION
POST /api/predict
```

Setelah `/api/predict` berhasil, frontend menerima seluruh hasil yang diperlukan untuk dashboard:

```text
Prediction
Feature Selection
Evaluation
Chart Data
```

Frontend **tidak perlu mengimplementasikan ulang algoritma atau perhitungan machine learning**.

Frontend hanya perlu:

```text
Upload CSV
    ↓
Call API
    ↓
Handle Loading
    ↓
Handle Error
    ↓
Store Response
    ↓
Format Data
    ↓
Render UI
```

Dengan mengikuti kontrak API di atas, frontend dapat dikembangkan secara independen dari implementasi internal model di backend.
