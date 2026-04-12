# import pickle
import pandas as pd
import os
import joblib
import ast

BASE = os.path.dirname(__file__)  # ✅ correct for Docker

# Load all recommendation CSVs
meds_df   = pd.read_csv(os.path.join(BASE, "datasets", "medicine", "recommendations", "medications.csv"))
diets_df  = pd.read_csv(os.path.join(BASE, "datasets", "medicine", "recommendations", "diets.csv"))
prec_df   = pd.read_csv(os.path.join(BASE, "datasets", "medicine", "recommendations", "precautions_df.csv"))
work_df   = pd.read_csv(os.path.join(BASE, "datasets", "medicine", "recommendations", "workout_df.csv"))
desc_df   = pd.read_csv(os.path.join(BASE, "datasets", "medicine", "extra", "description.csv"))

def get_recommendations(disease: str) -> dict:
    disease = (disease or "").strip()

    def fetch(df):
        df.columns = df.columns.str.strip().str.lower()
        row = df[df["disease"].str.strip().str.lower() == disease.lower()]
        return row.iloc[0].to_dict() if not row.empty else {}

    medications  = fetch(meds_df)
    diet         = fetch(diets_df)
    precautions  = fetch(prec_df)
    workout      = fetch(work_df)
    description  = fetch(desc_df)

    # Clean up — remove the Disease column from output
    for d in [medications, diet, precautions, workout, description]:
        d.pop("Disease", None)
    
    def clean_values(d):
        values = []
        for k, v in d.items():
           if k.lower() == "disease":
               continue
           if isinstance(v, str) and v.strip().startswith("["):
              try:
                  parsed = ast.literal_eval(v)
                  if isinstance(parsed, list):
                      values.extend(parsed)
                  else:
                      values.append(v)
              except:
                   values.append(v)
           else:
                if isinstance(v,(int,float)):
                    continue
                values.append(v)
        return values

    return {
    "medications": clean_values(medications),
    "diet": clean_values(diet),
    "precautions": clean_values(precautions),
    "workout": clean_values(workout),
    "description": description.get("Description", "") if description else ""
}