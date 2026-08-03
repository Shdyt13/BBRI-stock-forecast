import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. Preprocessing Data
def preprocess_data(df):
    # Menangani missing value dengan Forward Fill
    df = df.ffill()
    
    # Transformasi Log Return dari Close Price
    df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
    df = df.dropna()
    
    # Normalisasi Min-Max Scaling
    scaler = MinMaxScaler()
    fitur_numerik = ['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']
    df[fitur_numerik] = scaler.fit_transform(df[fitur_numerik])
    
    return df

# 2. Feature Selection menggunakan Random Forest Feature Importance
def select_features(X, y):
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    importance = rf.feature_importances_
    # Mengembalikan nilai importance untuk di-ranking
    return importance

# 3. Model Training & Tuning
def train_and_evaluate_models(X_train, y_train, X_test, y_test):
    # Inisiasi Time Series Split
    tscv = TimeSeriesSplit(n_splits=5)
    
    # Tuning SVR
    svr = SVR()
    svr_param_grid = {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto'], 'kernel': ['rbf']}
    svr_grid = GridSearchCV(svr, svr_param_grid, cv=tscv, scoring='neg_mean_squared_error')
    svr_grid.fit(X_train, y_train)
    svr_best = svr_grid.best_estimator_
    
    # Tuning Random Forest
    rf = RandomForestRegressor(random_state=42)
    rf_param_grid = {'n_estimators': [50, 100], 'max_depth': [None, 10, 20]}
    rf_grid = GridSearchCV(rf, rf_param_grid, cv=tscv, scoring='neg_mean_squared_error')
    rf_grid.fit(X_train, y_train)
    rf_best = rf_grid.best_estimator_
    
    # Prediksi
    svr_pred = svr_best.predict(X_test)
    rf_pred = rf_best.predict(X_test)
    
    # Evaluasi Metrik
    metrics = {
        'SVR': {
            'MAE': mean_absolute_error(y_test, svr_pred),
            'RMSE': np.sqrt(mean_squared_error(y_test, svr_pred)),
            'R2': r2_score(y_test, svr_pred)
        },
        'RandomForest': {
            'MAE': mean_absolute_error(y_test, rf_pred),
            'RMSE': np.sqrt(mean_squared_error(y_test, rf_pred)),
            'R2': r2_score(y_test, rf_pred)
        }
    }
    return metrics, svr_pred, rf_pred