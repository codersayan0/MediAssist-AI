import pandas as pd
import os
import ast

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset")

desc_df = None
diet_df = None
med_df  = None
prec_df = None
work_df = None


def read_csv_safe(filename):
    path = os.path.join(DATASET_PATH, filename)
    try:
        return pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    except Exception:
        return pd.read_csv(path, encoding="latin-1", on_bad_lines="skip")


def load_datasets():
    global desc_df, diet_df, med_df, prec_df, work_df

    if desc_df is not None:
        return

    print("📂 Loading datasets from:", DATASET_PATH)

    desc_df = read_csv_safe("description.csv")
    diet_df = read_csv_safe("diets.csv")
    med_df  = read_csv_safe("medications.csv")
    prec_df = read_csv_safe("precautions.csv")
    work_df = read_csv_safe("workout.csv")

    for df in [desc_df, diet_df, med_df, prec_df, work_df]:
        df.columns = df.columns.str.strip().str.lower()

    print("📋 DESC columns:", desc_df.columns.tolist())
    print("📋 First 5 disease names:", desc_df.iloc[:, 0].head().tolist())
    print("✅ Datasets loaded successfully")


def parse_list(value):
    if pd.isna(value):
        return []
    value = str(value).strip()
    if value.startswith("["):
        try:
            parsed = ast.literal_eval(value)
            return [str(i).strip() for i in parsed
                    if str(i).strip() not in ("", "nan", "NaN")]
        except Exception:
            pass
    if "," in value:
        return [i.strip() for i in value.split(",")
                if i.strip() not in ("", "nan", "NaN")]
    return [value] if value not in ("", "nan", "NaN", "Not available") else []


def fetch(df, disease):
    col = df.iloc[:, 0].astype(str).str.lower().str.strip()
    result = df[col == disease.lower().strip()]
    if not result.empty:
        return result.iloc[0, 1]
    partial = df[col.str.contains(disease.lower().strip(), na=False)]
    if not partial.empty:
        return partial.iloc[0, 1]
    return None


def get_info(disease):
    load_datasets()
    disease = disease.lower().strip()

    desc = fetch(desc_df, disease)
    diet = fetch(diet_df, disease)
    med  = fetch(med_df,  disease)
    prec = fetch(prec_df, disease)
    work = fetch(work_df, disease)

    print(f"🔍 Looking up: '{disease}'")
    print(f"   desc={str(desc)[:80] if desc else None}")

    return {
        "description": str(desc or "No description available."),
        "diet":        parse_list(diet),
        "medication":  parse_list(med),
        "precautions": parse_list(prec),
        "workout":     parse_list(work),
    }