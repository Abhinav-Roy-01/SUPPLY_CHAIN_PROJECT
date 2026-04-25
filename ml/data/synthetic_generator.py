import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

INDIAN_CITY_PAIRS = [
    ("Delhi", "Kanpur", 480, "NH19"),
    ("Delhi", "Agra", 200, "NH19"),
    ("Delhi", "Mumbai", 1400, "NH48"),
    ("Kanpur", "Lucknow", 80, "NH27"),
    ("Mumbai", "Pune", 150, "NH48"),
    ("Kolkata", "Patna", 570, "NH19"),
    ("Chennai", "Bangalore", 340, "NH44"),
    ("Hyderabad", "Bangalore", 570, "NH44"),
    ("Ahmedabad", "Mumbai", 530, "NH48"),
    ("Delhi", "Chandigarh", 250, "NH44"),
]

def generate_synthetic_trips(n=1000) -> pd.DataFrame:
    records = []
    
    for _ in range(n):
        origin, destination, distance, highway = random.choice(INDIAN_CITY_PAIRS)
        
        # Randomize features
        truck_health = random.randint(30, 100)
        driver_delay_rate = random.uniform(0.0, 0.4)
        rain_mm = random.choice([0, 0, 0, 0, 5, 15, 30, 50])  # skewed towards no rain
        is_friday = random.random() < 0.2
        is_night = random.random() < 0.25
        
        # Ground truth delay: probabilistic based on features
        delay_prob = (
            0.05  # base
            + (0.25 if rain_mm > 20 else 0.10 if rain_mm > 5 else 0)
            + (0.15 if is_friday else 0)
            + (0.10 if is_night else 0)
            + (0.20 if truck_health < 50 else 0.05 if truck_health < 70 else 0)
            + driver_delay_rate * 0.5
        )
        delay_prob = min(0.95, delay_prob)
        was_delayed = random.random() < delay_prob
        delay_hours = np.random.exponential(2.0) if was_delayed else 0
        
        records.append({
            'route_distance_km': distance + random.randint(-20, 20),
            'route_historical_delay_rate': random.uniform(0.1, 0.4),
            'truck_health_score': truck_health,
            'truck_age_days': random.randint(200, 3000),
            'driver_delay_rate': driver_delay_rate,
            'weather_rain_mm': rain_mm,
            'is_friday': is_friday,
            'is_night_trip': is_night,
            'fastag_balance': random.uniform(200, 5000),
            'eway_hours_remaining': random.uniform(4, 48),
            'load_weight_quintal': random.uniform(100, 800),
            'was_delayed': was_delayed,
            'actual_delay_hours': round(delay_hours, 1)
        })
    
    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_synthetic_trips(2000)
    
    output_dir = 'datasets'
    os.makedirs(output_dir, exist_ok=True)
    
    file_path = os.path.join(output_dir, 'synthetic_trips.csv')
    df.to_csv(file_path, index=False)
    print(f"Generated {len(df)} records at {file_path}. Delay rate: {df['was_delayed'].mean():.1%}")
