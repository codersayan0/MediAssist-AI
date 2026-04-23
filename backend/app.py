from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

# ✅ Import the function, NOT trigger at module load time
from download_files import ensure_all_files

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# ✅ Download files before anything else (safe, idempotent)
if not os.path.exists(MODEL_DIR):
    ensure_all_files()

# ✅ Now safe to import utils (datasets also live in BASE_DIR/dataset)
from utils import get_info

# ✅ Load models using explicit MODEL_DIR path
model   = pickle.load(open(os.path.join(MODEL_DIR, "disease_model.pkl"), "rb"))
encoder = pickle.load(open(os.path.join(MODEL_DIR, "encoder.pkl"), "rb"))
columns = pickle.load(open(os.path.join(MODEL_DIR, "columns.pkl"), "rb"))


# 🔧 Prepare input for ML
import pandas as pd

def prepare_input(symptoms):
    input_data = {col: [0] for col in columns}
    for symptom in symptoms:
        if symptom in input_data:
            input_data[symptom] = [1]
    return pd.DataFrame(input_data)


# ✅ 1. GET ALL SYMPTOMS
@app.route("/api/symptoms", methods=["GET"])
def get_symptoms():
    return jsonify(list(columns))


# ✅ 2. ANALYZE SYMPTOMS (ML)
@app.route("/api/analyze-symptoms", methods=["POST"])
def analyze_symptoms():
    data = request.json
    symptoms = data.get("symptoms", [])

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    input_data = prepare_input(symptoms)
    probs = model.predict_proba(input_data)[0]

    top3_idx = probs.argsort()[-3:][::-1]
    top3 = []
    for i in top3_idx:
        top3.append({
            "disease": encoder.inverse_transform([i])[0],
            "confidence": round(probs[i] * 100, 2)
        })

    disease = top3[0]["disease"]
    info = get_info(disease)

    if not info or not info.get("description"):
        info = {
            "description": "No detailed information available.",
            "diet": [],
            "medication": [],
            "precautions": [],
            "workout": []
        }

    return jsonify({
        "ml_prediction": {
            "disease": disease,
            "severity_score": 3,
            "urgency": "low",
            "top3_predictions": top3
        },
        "recommendations": {
            "description": info.get("description", ""),
            "diet": info.get("diet", []),
            "medications": info.get("medication", []),
            "precautions": info.get("precautions", []),
            "workout": info.get("workout", [])
        }
    })


# ✅ 3. MANUAL CBC ANALYSIS
@app.route("/api/analyze-cbc-manual", methods=["POST"])
def analyze_manual():
    data = request.json

    hb      = float(data.get("hemoglobin", 0))
    glucose = float(data.get("glucose", 0))
    wbc     = float(data.get("wbc", 0))

    disease  = "Healthy"
    severity = 1
    urgency  = "low"

    if glucose > 140:
        disease  = "Diabetes"
        severity = 5
        urgency  = "high"
    elif hb < 12:
        disease  = "Anemia"
        severity = 4
        urgency  = "medium"
    elif wbc > 11000:
        disease  = "Infection"
        severity = 3
        urgency  = "medium"

    info = get_info(disease)

    if not info or not info.get("description"):
        info = {
            "description": f"No detailed info available for {disease}.",
            "diet": ["Maintain balanced diet", "Stay hydrated"],
            "medication": [],
            "precautions": ["Consult doctor if symptoms persist"],
            "workout": []
        }

    return jsonify({
        "ml_prediction": {
            "disease": disease,
            "severity_score": severity,
            "urgency": urgency
        },
        "recommendations": {
            "description": info.get("description", ""),
            "diet": info.get("diet", []),
            "medications": info.get("medication", []),
            "precautions": info.get("precautions", []),
            "workout": info.get("workout", [])
        }
    })


# 🔁 Legacy route
@app.route("/predict", methods=["POST"])
def predict():
    return analyze_symptoms()


# 🚀 Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)