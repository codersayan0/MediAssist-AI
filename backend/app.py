from flask import Flask, request, jsonify
from flask_cors import CORS
from symptom_engine import predict_disease
from cbc_engine import analyze_cbc
from recommendation_engine import get_recommendations
from report_parser import extract_report_text
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Symptom Analysis ──────────────────────────────────────
@app.route("/api/analyze-symptoms", methods=["POST"])
def analyze_symptoms():
    data     = request.get_json()
    age      = data.get("age")
    gender   = data.get("gender")
    symptoms = data.get("symptoms", [])

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    try:
        ml_result       = predict_disease(symptoms)
        recommendations = get_recommendations(ml_result["disease"])
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

    return jsonify({
        "status":          "success",
        "ml_prediction":   ml_result,
        "recommendations": recommendations,
        "ai_analysis":     {}
    })

# ── CBC / Lab Report Upload ───────────────────────────────
@app.route("/api/analyze-report", methods=["POST"])
def analyze_report():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file   = request.files["file"]
    age    = request.form.get("patient_age")
    gender = request.form.get("patient_gender")

    os.makedirs("temp", exist_ok=True)
    temp_path = os.path.join("temp", file.filename)
    file.save(temp_path)

    try:
        extracted  = extract_report_text(temp_path)
        cbc_result = analyze_cbc(extracted)
    except Exception as e:
        return jsonify({"error": f"Report analysis failed: {str(e)}"}), 500
    finally:
        # Always delete temp file even if crash occurs
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # ✅ Fixed key name — matches cbc_engine.py return value
    condition       = cbc_result.get("predicted_condition", "Unknown")
    recommendations = get_recommendations(condition)

    return jsonify({
        "status":           "success",
        "extracted_values": extracted,
        "cbc_analysis":     cbc_result,
        "recommendations":  recommendations,
        "ai_analysis":      {}
    })

@app.route("/api/analyze-cbc-manual", methods=["POST"])
def analyze_cbc_manual():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        cbc_result = analyze_cbc(data)
        condition = cbc_result.get("predicted_condition", "Unknown")
        recommendations = get_recommendations(condition)

        return jsonify({
            "status": "success",
            "cbc_analysis": cbc_result,
            "recommendations": recommendations
        })

    except Exception as e:
        print("❌ CBC MANUAL ERROR:", e)  # debug in terminal
        return jsonify({"error": str(e)}), 500


# ── Health Check ──────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "MediAssist AI is running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)