import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

# Configuración y Constantes
BASE_PATH = r'c:\Users\usuario\Desktop\STORYTELLING\VISUALIZACION 2'
INPUT_FILE = os.path.join(BASE_PATH, 'Hoja de cálculo sin título.xlsx')
OUTPUT_DIR = os.path.join(BASE_PATH, 'panel', 'public', 'data')
LOG_FILE = os.path.join(BASE_PATH, 'origen', 'etl_log.json')
TRM_COP = 3670.20

CURRENCY_MAP = {
    "USD": 1.0, "GBP": 1.35, "EUR": 1.18, "CAD": 0.80,
    "AUD/NZD": 0.75, "CHF": 1.08, "ZAR": 0.068, "HKD": 0.13,
    "JPY": 0.009, "SEK": 0.11, "NZD": 0.70
}

def clean_country(country):
    if pd.isna(country): return "Unknown"
    country = str(country).strip().lower()
    if any(x in country for x in ["usa", "u.s.", "united states", "us", "america", "united state", "us of a", "u. s."]):
        return "United States"
    if any(x in country for x in ["uk", "u.k.", "united kingdom", "england", "scotland", "wales", "great britain"]):
        return "United Kingdom"
    if "canada" in country: return "Canada"
    if any(x in country for x in ["australia", "aus"]): return "Australia"
    return country.title()

def process_etl():
    print("Iniciando proceso ETL final...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    df_raw = pd.read_excel(INPUT_FILE)
    
    indices = {
        'edad': 1,
        'industria': 2,
        'cargo': 3,
        'salario_anual': 5,
        'comp_adicional': 6,
        'moneda': 7,
        'pais': 10,
        'ciudad': 12,
        'exp_total': 13,
        'exp_campo': 14,
        'educacion': 15,
        'genero': 16
    }
    
    data = {}
    for key, idx in indices.items():
        if idx < len(df_raw.columns):
            data[key] = df_raw.iloc[:, idx]
    
    df = pd.DataFrame(data)
    
    # Procesamiento
    df['pais_limpio'] = df['pais'].apply(clean_country)
    df['ciudad_limpia'] = df['ciudad'].fillna("Unknown").astype(str).str.strip().str.title()
    df['industria'] = df['industria'].fillna("Otras Industrias").astype(str).str.strip().str.title()
    
    df['salario_anual'] = pd.to_numeric(df['salario_anual'], errors='coerce').fillna(0)
    df['comp_adicional'] = pd.to_numeric(df['comp_adicional'], errors='coerce').fillna(0)
    
    def convert_logic(row):
        currency = str(row['moneda']).upper().strip()
        curr_key = "USD"
        for k in CURRENCY_MAP.keys():
            if k in currency:
                curr_key = k
                break
        
        rate = CURRENCY_MAP.get(curr_key, 1.0)
        s_base = float(row['salario_anual']) * rate
        c_extra = float(row['comp_adicional']) * rate
        
        # Corrección de magnitud
        if 0 < s_base < 100: s_base *= 1000
        if 0 < c_extra < 5: c_extra *= 1000
            
        return pd.Series([s_base * TRM_COP, c_extra * TRM_COP])

    df[['salario_anual_cop', 'compensaciones_cop']] = df.apply(convert_logic, axis=1)
    df['ingresos_totales_cop'] = df['salario_anual_cop'] + df['compensaciones_cop']
    
    # Exportación
    upper_limit = df['ingresos_totales_cop'].quantile(0.99)
    df_dashboard = df[df['ingresos_totales_cop'] <= upper_limit].copy()
    
    output_path = os.path.join(OUTPUT_DIR, 'processed_data.json')
    df_dashboard.to_json(output_path, orient='records', force_ascii=False)
    
    print(f"ETL Completado. Registros: {len(df_dashboard)}")
    print(f"Archivo: {output_path}")

if __name__ == "__main__":
    process_etl()
