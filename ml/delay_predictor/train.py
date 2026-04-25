import pandas as pd
import numpy as np
from xgboost import XGBClassifier, XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, mean_absolute_error
import pickle
import os

def train_models():
    # Load synthetic data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'datasets', 'synthetic_trips.csv')
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data not found at {data_path}. Run synthetic_generator.py first.")
        
    df = pd.read_csv(data_path)
    
    # Feature columns
    feature_cols = [
        'route_distance_km', 'route_historical_delay_rate', 
        'truck_health_score', 'truck_age_days', 'driver_delay_rate',
        'weather_rain_mm', 'is_friday', 'is_night_trip', 
        'fastag_balance', 'eway_hours_remaining', 'load_weight_quintal'
    ]
    
    X = df[feature_cols]
    y_class = df['was_delayed']
    y_reg = df['actual_delay_hours']
    
    X_train, X_test, y_train_class, y_test_class, y_train_reg, y_test_reg = train_test_split(
        X, y_class, y_reg, test_size=0.2, random_state=42
    )
    
    # 1. Classification Model (Delay Probability)
    print("Training Delay Classifier...")
    classifier = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='logloss',
        random_state=42
    )
    classifier.fit(X_train, y_train_class)
    
    # Evaluate Classifier
    y_pred_class = classifier.predict(X_test)
    y_pred_proba = classifier.predict_proba(X_test)[:, 1]
    print(classification_report(y_test_class, y_pred_class))
    print(f"ROC AUC: {roc_auc_score(y_test_class, y_pred_proba):.4f}")
    
    # 2. Regression Model (Delay Hours) - only train on actual delays
    print("\nTraining Delay Regressor...")
    X_train_delayed = X_train[y_train_class == True]
    y_train_reg_delayed = y_train_reg[y_train_class == True]
    
    regressor = XGBRegressor(
        n_estimators=200, 
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    regressor.fit(X_train_delayed, y_train_reg_delayed)
    
    # Evaluate Regressor
    X_test_delayed = X_test[y_test_class == True]
    y_test_reg_delayed = y_test_reg[y_test_class == True]
    
    if len(X_test_delayed) > 0:
        y_pred_reg = regressor.predict(X_test_delayed)
        print(f"MAE on delayed trips: {mean_absolute_error(y_test_reg_delayed, y_pred_reg):.2f} hours")
    
    # Save models
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    with open(os.path.join(os.path.dirname(__file__), 'delay_model.pkl'), 'wb') as f:
        pickle.dump({
            'classifier': classifier,
            'regressor': regressor,
            'features': feature_cols
        }, f)
        
    print("Models saved successfully to delay_model.pkl")

if __name__ == "__main__":
    train_models()
