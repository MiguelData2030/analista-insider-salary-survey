# 📊 Analista Insider: Ask A Manager Salary Survey 2021

Este proyecto es una herramienta de investigación interna diseñada para analistas de datos, que procesa y visualiza los resultados de la encuesta salarial global de **Ask A Manager 2021**.

![Next.js](https://img.shields.io/badge/Next.js-14.0+-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)

## 🎯 Objetivo
Transformar datos crudos de una encuesta global en insights accionables para la toma de decisiones sobre compensación y geografía, normalizando valores a **Pesos Colombianos (COP)**.

## 🛠️ Stack Tecnológico
- **ETL (Data Engineering)**: Python, Pandas, Openpyxl.
- **Frontend (Visualización)**: Next.js (App Router), React, Recharts, Lucide Icons, Framer Motion.
- **Estilos**: Tailwind CSS (Dark Mode Premium).
- **Despliegue**: Vercel.

## 🚀 Características
1. **Limpieza de Datos**: Normalización de geografía y corrección de magnitudes salariales.
2. **Conversión Monetaria**: TRM aplicada de $3,670.20 COP/USD.
3. **KPIs Interactivos**: Total de registros, promedio salarial y tendencias.
4. **Análisis de Dispersión**: Relación entre años de experiencia y salario.
5. **Documentación del Modelo**: Sección técnica integrada para transparencia metodológica.

## 📂 Estructura del Proyecto
```bash
├── dashboard/          # Aplicación Next.js (Dashboard premium)
│   ├── public/data/    # Datos procesados (JSON)
│   └── app/            # Componentes de UI y lógica de visualización
├── src/                # Scripts de ingeniería de datos
│   ├── etl_process.py  # Pipeline de limpieza y transformación
│   └── etl_log.json    # Logs de auditoría de procesos
├── DEPLOY_V0.md        # Guía técnica para analistas
└── README.md           # Documentación principal
```

## ⚙️ Cómo ejecutar
### 1. Proceso de Datos (ETL)
```bash
pip install pandas openpyxl
python src/etl_process.py
```

### 2. Ejecutar Dashboard Localmente
```bash
cd dashboard
npm install
npm run dev
```

## 🌐 Despliegue en Vercel
Este repositorio está listo para ser conectado a Vercel. Asegúrate de:
1. Conectar tu repositorio de GitHub.
2. Usar el directorio de instalación `dashboard/`.
3. Build command: `npm run build`.

---
**Desarrollado como Senior Data Engineer | 2026**
