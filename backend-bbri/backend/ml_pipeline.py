import pandas as pd
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


FEATURES = ["Open", "High", "Low", "Close", "Adj Close", "Volume"]


# =========================================================
# 1. PREPROCESSING
# =========================================================


def preprocess_data(df):
    df = df.copy()

    # Bersihkan nama kolom
    df.columns = df.columns.str.strip()

    # Pastikan Date tersedia
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])

    # Konversi fitur numerik
    for col in FEATURES:
        if col in df.columns:

            if df[col].dtype == "object":
                df[col] = df[col].astype(str).str.replace(",", "", regex=False)

            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Forward fill sesuai proposal
    df = df.ffill()

    # Jika masih ada NaN di awal
    df = df.bfill()

    # Log Return
    df["Log_Return"] = np.log(df["Close"] / df["Close"].shift(1))

    return df


# =========================================================
# 2. MEMBENTUK TARGET HARI BERIKUTNYA
# =========================================================


def create_next_day_target(df):
    df = df.copy()

    # Target adalah Log Return hari berikutnya
    df["Target_Log_Return"] = df["Log_Return"].shift(-1)

    # Target Close hari berikutnya
    df["Target_Close"] = df["Close"].shift(-1)

    # Tanggal target
    if "Date" in df.columns:
        df["Target_Date"] = df["Date"].shift(-1)

    return df


# =========================================================
# 3. NORMALISASI
# =========================================================


def scale_features(X_train, X_test, X_future=None):

    scaler = MinMaxScaler()

    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
    )

    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test), columns=X_test.columns, index=X_test.index
    )

    X_future_scaled = None

    if X_future is not None:
        X_future_scaled = pd.DataFrame(
            scaler.transform(X_future), columns=X_future.columns, index=X_future.index
        )

    return (X_train_scaled, X_test_scaled, X_future_scaled, scaler)


# =========================================================
# 4. FEATURE SELECTION
# =========================================================


def select_features(X_train, y_train, top_k=4):

    # OPTIMIZED: Reduce n_estimators from 100 to 50 for faster feature importance
    rf = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)

    rf.fit(X_train, y_train)

    importance = rf.feature_importances_

    ranking = []

    for i, col in enumerate(X_train.columns):

        ranking.append({"name": col, "score": float(importance[i])})

    ranking = sorted(ranking, key=lambda x: x["score"], reverse=True)

    for i, item in enumerate(ranking):

        item["rank"] = i + 1

        item["status"] = "selected" if i < top_k else "dropped"

    return ranking


# =========================================================
# 5. TRAINING + HYPERPARAMETER TUNING
# =========================================================


def train_and_evaluate_models(X_train, y_train, X_test, y_test):

    # OPTIMIZED: Reduce cv splits from 5 to 3 for faster processing
    tscv = TimeSeriesSplit(n_splits=3)

    # =====================================================
    # SVR - ULTRA OPTIMIZED (2 combinations only)
    # =====================================================

    svr = SVR(kernel="rbf")

    # OPTIMIZED: Drastically reduced from 24 to 2 combinations
    svr_param_grid = {
        "C": [1, 10],  # Reduced: 4 → 2
        "epsilon": [0.1],  # Reduced: 3 → 1
        "gamma": ["scale"],  # Reduced: 2 → 1
    }
    # Total combinations: 2 × 1 × 1 = 2 (was 24)

    svr_grid = GridSearchCV(
        estimator=svr,
        param_grid=svr_param_grid,
        cv=tscv,
        scoring="neg_mean_squared_error",
        n_jobs=-1,  # Multi-core processing
    )

    svr_grid.fit(X_train, y_train)

    svr_best = svr_grid.best_estimator_

    # =====================================================
    # RANDOM FOREST - ULTRA OPTIMIZED (2 combinations only)
    # =====================================================

    rf = RandomForestRegressor(random_state=42)

    # OPTIMIZED: Drastically reduced from 12 to 2 combinations
    rf_param_grid = {
        "n_estimators": [50, 100],  # Reduced: kept 2 (was 2)
        "max_depth": [10],  # Reduced: 3 → 1
        "min_samples_split": [2],  # Reduced: 2 → 1
    }
    # Total combinations: 2 × 1 × 1 = 2 (was 12)

    rf_grid = GridSearchCV(
        estimator=rf,
        param_grid=rf_param_grid,
        cv=tscv,
        scoring="neg_mean_squared_error",
        n_jobs=-1,  # Multi-core processing
    )

    rf_grid.fit(X_train, y_train)

    rf_best = rf_grid.best_estimator_

    # =====================================================
    # PREDICTION
    # =====================================================

    svr_pred = svr_best.predict(X_test)
    rf_pred = rf_best.predict(X_test)

    # =====================================================
    # METRICS
    # =====================================================

    metrics = {
        "SVR": {
            "MAE": float(mean_absolute_error(y_test, svr_pred)),
            "RMSE": float(np.sqrt(mean_squared_error(y_test, svr_pred))),
            "R2": float(r2_score(y_test, svr_pred)),
        },
        "RandomForest": {
            "MAE": float(mean_absolute_error(y_test, rf_pred)),
            "RMSE": float(np.sqrt(mean_squared_error(y_test, rf_pred))),
            "R2": float(r2_score(y_test, rf_pred)),
        },
    }

    return (metrics, svr_pred, rf_pred, svr_best, rf_best)
