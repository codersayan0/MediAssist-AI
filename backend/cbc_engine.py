# import pickle
import pandas as pd
import numpy as np
import os
import joblib

BASE = os.path.dirname(__file__)  

cbc_model = joblib.load(os.path.join(BASE, "models", "cbc_model.pkl"))

cbc_columns = joblib.load(os.path.join(BASE, "models", "cbc_columns.pkl"))

# Normal ranges for flagging
NORMAL_RANGES = {
    "wbc":         (4.5,  11.0),
    "rbc":         (4.2,   5.9),
    "hemoglobin":  (12.0, 17.5),
    "hematocrit":  (36.0, 50.0),
    "platelets":   (150,  400),
    "neutrophils": (40,   70),
    "lymphocytes": (20,   40),
}

def analyze_cbc(extracted_values: dict) -> dict:
    abnormal_flags = []
    for key, (low, high) in NORMAL_RANGES.items():
        val = extracted_values.get(key)
        if val is not None:
            try:
                val = float(val)
                if val < low:
                    abnormal_flags.append({"parameter": key, "value": val, "status": "LOW", "normal": f"{low}–{high}"})
                elif val > high:
                    abnormal_flags.append({"parameter": key, "value": val, "status": "HIGH", "normal": f"{low}–{high}"})
            except (ValueError, TypeError):
                pass

    # Build model input
    row = {
    col: float(extracted_values.get(col, 0) or 0)
    for col in cbc_columns
}
    input_df = pd.DataFrame([row])

    prediction = None
    try:
        prediction = cbc_model.predict(input_df)[0]
    except Exception:
        prediction = "Unable to classify — insufficient values"

    return {
        "condition": prediction,
        "abnormal_flags": abnormal_flags,
        "total_abnormal": len(abnormal_flags)
    }