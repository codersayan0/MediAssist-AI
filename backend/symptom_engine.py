import numpy as np
import pandas as pd
import os
import joblib

# ── PATH — works for both local and Docker ────────────────
BASE = os.path.dirname(__file__)  
BASE_DOCKER = os.path.dirname(os.path.abspath(__file__))

BASE = BASE_DOCKER if os.path.exists(os.path.join(BASE_DOCKER, "models")) else BASE_LOCAL

# ── LOAD MODELS ───────────────────────────────────────────
symptom_model   = joblib.load(os.path.join(BASE, "models", "symptom_model.pkl"))
symptom_columns = joblib.load(os.path.join(BASE, "models", "symptom_columns.pkl"))

# ── LOAD SEVERITY MAP ─────────────────────────────────────
severity_df = pd.read_csv(
    os.path.join(BASE, "datasets", "medicine", "core", "Symptom-severity.csv")
)
severity_map = dict(zip(
    severity_df["Symptom"].str.strip().str.lower().str.replace(" ", "_"),
    severity_df["weight"]
))

# ── PREDICT ───────────────────────────────────────────────
def predict_disease(symptoms: list) -> dict:

    # Build binary feature vector
    input_vector = np.zeros(len(symptom_columns))

    #  Build index once, never overwrite inside loop
    column_index = {col: i for i, col in enumerate(symptom_columns)}

    for s in symptoms:
        s_clean = s.strip().lower().replace(" ", "_")
        if s_clean in column_index:
            input_vector[column_index[s_clean]] = 1

    input_df = pd.DataFrame([input_vector], columns=symptom_columns)

    # Predict disease
    predicted = symptom_model.predict(input_df)[0]

    # Top-3 probabilities
    top3 = []
    if hasattr(symptom_model, "predict_proba"):
        probs      = symptom_model.predict_proba(input_df)[0]
        top3_idx   = np.argsort(probs)[-3:][::-1]
        classes    = symptom_model.classes_
        top3 = [
            {
                "disease":    classes[i],
                "confidence": round(float(probs[i]) * 100, 1)
            }
            for i in top3_idx
        ]

    # Normalize spaces to underscores before severity lookup
    severity_score = sum(
        severity_map.get(s.lower().strip().replace(" ", "_"), 0)
        for s in symptoms
    )
    urgency = "high" if severity_score >= 13 else "medium" if severity_score >= 7 else "low"

    return {
        "disease":          predicted,
        "top3_predictions": top3,
        "severity_score":   int(severity_score),
        "urgency":          urgency
    }