import fitz
import pytesseract
from PIL import Image
import re, io, os

# Auto-detect environment
# Windows local → use installed path
# Docker        → tesseract is in system PATH automatically
if os.name == "nt": 
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

CBC_PATTERNS = {
    "wbc":         r"(?:wbc|white blood cell)[^\d]*([\d.]+)",
    "rbc":         r"(?:rbc|red blood cell)[^\d]*([\d.]+)",
    "hemoglobin":  r"(?:hemoglobin|hgb|hb)[^\d]*([\d.]+)",
    "hematocrit":  r"(?:hematocrit|hct)[^\d]*([\d.]+)",
    "platelets":   r"(?:platelet|plt)[^\d]*([\d.]+)",
    "neutrophils": r"(?:neutrophil|neut)[^\d]*([\d.]+)",
    "lymphocytes": r"(?:lymphocyte|lymph)[^\d]*([\d.]+)",
}

def extract_report_text(file_path: str) -> dict:
    text = ""

    try:
        if file_path.lower().endswith(".pdf"):
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()

            if len(text.strip()) < 30:
                for page in doc:
                    pix = page.get_pixmap(dpi=300)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    text += pytesseract.image_to_string(img)
            doc.close()
        else:
            with Image.open(file_path) as img:
                text = pytesseract.image_to_string(img)

    except pytesseract.TesseractNotFoundError:
        print("Tesseract not found — OCR skipped")
        text = ""
    except Exception as e:
        print(f"Extraction error: {e}")
        text = ""

    extracted = {}
    if text:
        text_lower = text.lower()
        for param, pattern in CBC_PATTERNS.items():
            matches = re.findall(pattern, text_lower)
            if matches:
                try:
                    extracted[param] = float(matches[0])
                except ValueError:
                    pass

    extracted["raw_text"] = text[:2000] if text else "OCR unavailable — use manual CBC entry."
    return extracted