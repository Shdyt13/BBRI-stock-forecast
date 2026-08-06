# ✅ CHECKLIST INTEGRASI BACKEND TIM

**Gunakan checklist ini untuk memverifikasi integrasi berjalan dengan benar.**

---

## 📋 PRE-LAUNCH CHECKLIST

### 1. File Verification

- [x] `docker-compose.yml` mengarah ke `./backend-bbri/backend`
- [x] `frontend/src/context/DataContext.jsx` sudah di-update
- [x] `backend-bbri/backend/main.py` ada dan valid
- [x] `backend-bbri/backend/ml_pipeline.py` ada dan valid
- [x] `backend-bbri/backend/requirements.txt` ada dan valid
- [x] `backend-bbri/backend/Dockerfile` ada

### 2. Documentation Check

- [x] `TEAM_BACKEND_INTEGRATION_COMPLETE.md` sudah dibuat
- [x] `QUICK_START_INTEGRATED.md` sudah dibuat
- [x] `INTEGRATION_SUMMARY.md` sudah dibuat
- [x] `backend-bbri/backend/README.md` sudah dibaca

---

## 🚀 LAUNCH CHECKLIST

### Step 1: Start Docker

```bash
cd "c:\Users\HP\Documents\JASA WEBSITE\prediksi saham BBRI"
docker-compose up --build
```

**Verifikasi:**

- [ ] Container `bbri-prediction-backend` running
- [ ] Container `bbri-prediction-frontend` running
- [ ] Tidak ada error di terminal
- [ ] Backend log menampilkan: `Uvicorn running on http://0.0.0.0:8000`
- [ ] Frontend log menampilkan: `Local: http://localhost:3000/`

### Step 2: Backend Health Check

```bash
# Buka di browser atau curl
http://localhost:8000/docs
```

**Verifikasi:**

- [ ] Swagger UI terbuka
- [ ] Endpoint `/api/upload` terlihat
- [ ] Endpoint `/api/predict` terlihat
- [ ] CORS diaktifkan (cek di Network tab)

### Step 3: Frontend Health Check

```bash
# Buka di browser
http://localhost:3000
```

**Verifikasi:**

- [ ] Halaman homepage terbuka
- [ ] Tidak ada error di console
- [ ] Layout tampil dengan benar
- [ ] Sidebar menu terlihat
- [ ] Upload button ada

---

## 🧪 FUNCTIONAL TESTING

### Test 1: File Upload

**Steps:**

1. Klik tombol "Choose File"
2. Pilih file CSV (contoh: `BBRI_2015_2025.csv`)
3. File name muncul di UI

**Expected Result:**

- [ ] File name ditampilkan
- [ ] Tidak ada error message
- [ ] Button "RUN PREDICTION" enabled

### Test 2: Run Prediction

**Steps:**

1. Klik button "RUN PREDICTION"
2. Tunggu loading spinner

**Expected Result:**

- [ ] Loading spinner muncul
- [ ] Loading time: 10-30 detik
- [ ] Console log menampilkan:
  ```
  📤 Step 1: Uploading dataset to team backend...
  ✅ Upload success: {...}
  🤖 Step 2: Running ML prediction pipeline...
  ✅ Prediction success: {...}
  ✅ Integration completed!
  ```
- [ ] Tidak ada error di console
- [ ] Dashboard langsung menampilkan hasil

### Test 3: Dashboard Display

**Expected Result:**

- [ ] Grafik 3 garis muncul (Actual + SVR + RF)
- [ ] Garis berwarna berbeda (biru, hijau, merah)
- [ ] Legend chart terlihat
- [ ] Card metrik menampilkan angka
- [ ] MAE, RMSE, R² untuk SVR ditampilkan
- [ ] MAE, RMSE, R² untuk RF ditampilkan
- [ ] Nilai metrik berbeda antara SVR dan RF

### Test 4: Scenario Toggle

**Steps:**

1. Klik radio button "Gunakan Feature Selection"
2. Perhatikan perubahan grafik
3. Klik radio button "Tanpa Feature Selection"
4. Perhatikan perubahan grafik

**Expected Result:**

- [ ] Grafik update secara instant
- [ ] Nilai metrik berubah
- [ ] Tidak ada loading tambahan
- [ ] Tidak ada error

### Test 5: Feature Selection Page

**Steps:**

1. Klik menu "Feature Selection" di sidebar
2. Tunggu page load

**Expected Result:**

- [ ] Halaman berpindah tanpa reload
- [ ] Tabel ranking fitur muncul
- [ ] Bar chart importance muncul
- [ ] Badge "Selected" ✅ atau "Dropped" ❌ terlihat
- [ ] Score importance ditampilkan
- [ ] Ada 4 fitur dengan status "selected"

### Test 6: Model Evaluation Page

**Steps:**

1. Klik menu "Model Evaluation" di sidebar
2. Tunggu page load

**Expected Result:**

- [ ] Halaman berpindah tanpa reload
- [ ] Tabel metrik muncul
- [ ] Kolom SVR dan RF terpisah
- [ ] Tab "All Features" dan "Selected Features" ada
- [ ] Switching tab berfungsi
- [ ] Nilai metrik berbeda per tab

### Test 7: Data Persistence

**Steps:**

1. Dari Dashboard, klik menu "Feature Selection"
2. Klik kembali ke "Dashboard"
3. Perhatikan data

**Expected Result:**

- [ ] Data grafik tetap sama (tidak hilang)
- [ ] Tidak perlu RUN PREDICTION ulang
- [ ] Tidak ada loading
- [ ] State scenario tetap terjaga

---

## 🔍 DATA VALIDATION

### Backend Response Structure Check

**Buka Console (F12) setelah prediction:**

**Cek `teamData` (original):**

```javascript
{
  "message": "...",
  "prediction": { ... },
  "metrics": {
    "All_Features": { "SVR": {...}, "RandomForest": {...} },
    "Selected_Features": { "SVR": {...}, "RandomForest": {...} }
  },
  "chart_data": {
    "actual": [array],
    "svr_selected": [array],
    "rf_selected": [array],
    "svr_all": [array],
    "rf_all": [array]
  }
}
```

**Verifikasi:**

- [ ] `metrics.All_Features.SVR` ada
- [ ] `metrics.Selected_Features.SVR` ada
- [ ] `chart_data.actual` adalah array
- [ ] Array `actual`, `svr_selected`, dll panjangnya sama (50 items)

**Cek `mappedData` (transformed):**

```javascript
{
  "results": {
    "without_feature_selection": {
      "svr": { "metrics": {...}, "predictions": [...] },
      "rf": { "metrics": {...}, "predictions": [...] }
    },
    "with_feature_selection": {
      "svr": { "metrics": {...}, "predictions": [...] },
      "rf": { "metrics": {...}, "predictions": [...] }
    }
  },
  "feature_importance": [...]
}
```

**Verifikasi:**

- [ ] `results.without_feature_selection.svr.metrics` ada
- [ ] `results.with_feature_selection.svr.metrics` ada
- [ ] `predictions` adalah array of objects dengan `date`, `actual`, `prediction`
- [ ] `feature_importance` adalah array
- [ ] `_teamOriginal` menyimpan data asli

---

## 🐛 ERROR TESTING

### Test 1: Invalid File Format

**Steps:**

1. Upload file `.txt` atau `.xlsx`

**Expected Result:**

- [ ] Error message: "File harus berformat CSV!"
- [ ] Prediction tidak berjalan
- [ ] UI tetap responsive

### Test 2: Backend Down

**Steps:**

1. Stop backend container: `docker stop bbri-prediction-backend`
2. Coba RUN PREDICTION

**Expected Result:**

- [ ] Error message muncul
- [ ] Error: "Failed to fetch" atau "Network error"
- [ ] Loading spinner berhenti
- [ ] UI tidak crash

### Test 3: Empty/Invalid CSV

**Steps:**

1. Upload CSV kosong atau dengan kolom salah

**Expected Result:**

- [ ] Backend error ditangkap
- [ ] Error message ditampilkan
- [ ] Frontend tidak crash

---

## 📊 PERFORMANCE CHECK

### Timing Benchmarks

**Record waktu untuk setiap tahap:**

| Task                    | Expected        | Actual | Status |
| ----------------------- | --------------- | ------ | ------ |
| File upload             | < 2 detik       | **\_** | [ ]    |
| `/api/upload` response  | 1-2 detik       | **\_** | [ ]    |
| `/api/predict` response | 10-30 detik     | **\_** | [ ]    |
| Data mapping            | < 1 detik       | **\_** | [ ]    |
| Chart rendering         | < 1 detik       | **\_** | [ ]    |
| Page navigation         | < 500ms         | **\_** | [ ]    |
| **Total E2E**           | **15-40 detik** | **\_** | [ ]    |

**Note:** Jika `/api/predict` > 60 detik, cek:

- [ ] Ukuran file CSV (< 10MB recommended)
- [ ] Docker logs untuk error
- [ ] GridSearchCV terlalu banyak kombinasi

---

## 🔐 SECURITY CHECK

### CORS Configuration

**Buka DevTools → Network → cek response headers:**

**Expected:**

- [ ] `Access-Control-Allow-Origin: *`
- [ ] `Access-Control-Allow-Methods: *`
- [ ] `Access-Control-Allow-Headers: *`

### File Validation

**Expected:**

- [ ] Only `.csv` files accepted
- [ ] File size limit enforced (browser default ~10MB)
- [ ] No arbitrary code execution from CSV

---

## 📱 BROWSER COMPATIBILITY

### Test pada browser berbeda:

**Chrome:**

- [ ] All features work
- [ ] No console errors
- [ ] Chart renders correctly

**Firefox:**

- [ ] All features work
- [ ] No console errors
- [ ] Chart renders correctly

**Edge:**

- [ ] All features work
- [ ] No console errors
- [ ] Chart renders correctly

---

## 🎓 DEVELOPER CHECKLIST

### Code Quality

- [x] No hardcoded values
- [x] Error handling implemented
- [x] Console logs for debugging
- [x] Comments for complex logic
- [x] Function names descriptive

### Documentation

- [x] API endpoints documented
- [x] Data mapping explained
- [x] Troubleshooting guide available
- [x] Quick start guide created

### Git Status

- [ ] Changes committed
- [ ] Commit message descriptive
- [ ] No sensitive data in code

---

## ✅ FINAL VERIFICATION

**Before marking complete, ensure:**

- [ ] Docker containers running stably
- [ ] All 7 functional tests passed
- [ ] Data validation checks passed
- [ ] Performance within acceptable range
- [ ] No critical errors in logs
- [ ] Documentation complete and accurate
- [ ] Team members can run with `docker-compose up`

---

## 📝 NOTES & ISSUES

**Gunakan section ini untuk mencatat temuan:**

### Issues Found:

```
(Tulis di sini jika ada masalah)

Example:
- Loading time > 30 detik pada dataset 3000 rows
- Chart warna kurang kontras
- etc.
```

### Resolved:

```
(Tulis di sini jika sudah fix)

Example:
- ✅ Reduced GridSearchCV to 3 cv
- ✅ Changed chart colors
```

---

## 🚀 READY TO DEPLOY?

**Jika semua checklist ✅, sistem siap untuk:**

- [ ] Demo ke tim
- [ ] Presentasi ke client
- [ ] Production deployment
- [ ] User testing

---

**SELAMAT! INTEGRASI SELESAI!** 🎉

**Command untuk start:**

```bash
docker-compose up --build
```

**Access:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
