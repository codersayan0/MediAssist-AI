# ================================
# MediAssist AI - Report Analyzer (DISABLED VERSION)
# ================================

import re

# 🚫 OCR REMOVED — lightweight mode

def extract_text(image_path):
    """
    OCR disabled.
    This function is kept only to avoid breaking imports.
    """
    return ""


# 🧠 Extract numeric values (kept for future use)
def extract_value(pattern, text):
    match = re.search(pattern, text)
    if match:
        return float(match.group(1))
    return None


# 🔍 Analyze report (disabled fallback)
def analyze_report_data(text):
    """
    This feature is currently disabled.
    Returns default response.
    """

    return {
        "disease": "Feature Disabled",
        "severity": 0,
        "urgency": "low"
    }