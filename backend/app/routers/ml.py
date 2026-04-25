from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle
import os
import pandas as pd

router = APIRouter()

# Load the trained ML model globally
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'delay_predictor', 'delay_model.pkl')

classifier = None
regressor = None
features_list = None

try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
            classifier = model_data['classifier']
            regressor = model_data['regressor']
            features_list = model_data['features']
except Exception as e:
    print(f"Error loading model: {e}")

class TripFeaturesSchema(BaseModel):
    route_distance_km: float
    route_historical_delay_rate: float
    truck_health_score: int
    truck_age_days: int
    driver_delay_rate: float
    weather_rain_mm: float
    is_friday: bool
    is_night_trip: bool
    fastag_balance: float
    eway_hours_remaining: float
    load_weight_quintal: float

@router.post("/predict-delay")
async def predict_delay(trip_features: TripFeaturesSchema):
    if classifier is None or regressor is None:
        raise HTTPException(status_code=503, detail="ML Model not loaded or not trained yet.")
        
    try:
        # Create DataFrame from input
        input_data = pd.DataFrame([trip_features.dict()])
        
        # Ensure column order matches training
        input_data = input_data[features_list]
        
        probability = classifier.predict_proba(input_data)[0][1]
        
        delay_hours = 0
        if probability > 0.5:
            delay_hours = regressor.predict(input_data)[0]
            
        return {
            "delay_probability": round(float(probability), 4),
            "estimated_delay_hours": round(float(delay_hours), 1),
            "risk_level": "high" if probability > 0.7 else "medium" if probability > 0.4 else "low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
