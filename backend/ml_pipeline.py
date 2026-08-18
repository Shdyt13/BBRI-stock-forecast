import pandas as pd
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

FEATURES = [
    "Open",
    "High",
    "Low",
    "Close",
    "Adj Close",
    "Volume"
]


# =====================================================================
# HELPER: PEMBERSIH ANGKA DESIMAL (ANTI NaN / INFINITY UNTUK JSON)
# =====================================================================
def clean_float(val) -> float:
    """
    Mengubah nilai NaN, Infinity, atau -Infinity menjadi 0.0
    agar tidak menyebabkan crash 'Out of range float values' pada JSON FastAPI.
    """
    if val is None or np.isnan(val) or np.isinf(val):
        return 0.0
    return float(val)


# =====================================================================
# 1. PRA-PEMROSESAN DATA
# =====================================================================
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = df.columns.str.strip()

    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        df = df.dropna(subset=["Date"]).sort_values(by="Date", ascending=True).reset_index(drop=True)

    for col in FEATURES:
        if col in df.columns:
            if df[col].dtype == "object":
                df[col] = (
                    df[col]
                    .astype(str)
                    .str.replace(",", "", regex=False)
                    .str.strip()
                )
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.ffill().bfill()

    # Transformasi Log Return & bersihkan NaN/Inf di baris pertama
    df["Log_Return"] = np.log(df["Close"] / df["Close"].shift(1))
    df["Log_Return"] = df["Log_Return"].replace([np.inf, -np.inf], np.nan).fillna(0.0)

    return df


# =====================================================================
# 2. PEMBENTUKAN TARGET PREDIKSI
# =====================================================================
def create_next_day_target(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Target_Log_Return"] = df["Log_Return"].shift(-1)
    df["Target_Close"] = df["Close"].shift(-1)
    if "Date" in df.columns:
        df["Target_Date"] = df["Date"].shift(-1)
    return df


# =====================================================================
# 3. NORMALISASI MIN-MAX SCALING
# =====================================================================
def scale_features(X_train: pd.DataFrame, X_test: pd.DataFrame, X_future: pd.DataFrame = None):
    scaler = MinMaxScaler(feature_range=(0, 1))

    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=X_train.columns,
        index=X_train.index
    )

    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=X_test.columns,
        index=X_test.index
    )

    X_future_scaled = None
    if X_future is not None:
        X_future_scaled = pd.DataFrame(
            scaler.transform(X_future),
            columns=X_future.columns,
            index=X_future.index
        )

    return X_train_scaled, X_test_scaled, X_future_scaled, scaler


# =====================================================================
# 4. SELEKSI FITUR (FEATURE SELECTION)
# =====================================================================
def select_features(X_train: pd.DataFrame, y_train: pd.Series, top_k: int = 4) -> list:
    rf = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    importance = rf.feature_importances_

    ranking = []
    for i, col in enumerate(X_train.columns):
        ranking.append({
            "name": col,
            "score": clean_float(importance[i])
        })

    ranking = sorted(ranking, key=lambda x: x["score"], reverse=True)

    for i, item in enumerate(ranking):
        item["rank"] = i + 1
        item["status"] = "selected" if i < top_k else "dropped"

    return ranking


# =====================================================================
# 5. PELATIHAN, OPTIMASI, & EVALUASI MODEL
# =====================================================================
def train_and_evaluate_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    prev_close_test: pd.Series
):
    tscv = TimeSeriesSplit(n_splits=5)

    # A. SUPPORT VECTOR REGRESSION (SVR)
    svr = SVR(kernel="rbf")
    svr_param_grid = {
        "C": [0.1, 1, 10, 100],
        "epsilon": [0.01, 0.1, 0.2],
        "gamma": ["scale", "auto"]
    }
    svr_grid = GridSearchCV(
        estimator=svr,
        param_grid=svr_param_grid,
        cv=tscv,
        scoring="neg_mean_squared_error",
        n_jobs=-1
    )
    svr_grid.fit(X_train, y_train)
    svr_best = svr_grid.best_estimator_

    # B. RANDOM FOREST REGRESSOR
    rf = RandomForestRegressor(random_state=42)
    rf_param_grid = {
        "n_estimators": [50, 100],
        "max_depth": [None, 10, 20],
        "min_samples_split": [2, 5]
    }
    rf_grid = GridSearchCV(
        estimator=rf,
        param_grid=rf_param_grid,
        cv=tscv,
        scoring="neg_mean_squared_error",
        n_jobs=-1
    )
    rf_grid.fit(X_train, y_train)
    rf_best = rf_grid.best_estimator_

    # C. PREDIKSI LOG RETURN
    svr_pred_log = svr_best.predict(X_test)
    rf_pred_log = rf_best.predict(X_test)

    # D. KONVERSI KE HARGA CLOSE ASLI (IDR)
    actual_close = prev_close_test.values * np.exp(y_test.values)
    svr_pred_close = prev_close_test.values * np.exp(svr_pred_log)
    rf_pred_close = prev_close_test.values * np.exp(rf_pred_log)

    # E. PERHITUNGAN METRIK EVALUASI (DIBERSIHKAN DENGAN clean_float)
    metrics = {
        "SVR": {
            "MAE": clean_float(mean_absolute_error(actual_close, svr_pred_close)),
            "RMSE": clean_float(np.sqrt(mean_squared_error(actual_close, svr_pred_close))),
            "R2": clean_float(r2_score(actual_close, svr_pred_close))
        },
        "RandomForest": {
            "MAE": clean_float(mean_absolute_error(actual_close, rf_pred_close)),
            "RMSE": clean_float(np.sqrt(mean_squared_error(actual_close, rf_pred_close))),
            "R2": clean_float(r2_score(actual_close, rf_pred_close))
        }
    }

    return (
        metrics,
        svr_pred_close,
        rf_pred_close,
        svr_best,
        rf_best
    )