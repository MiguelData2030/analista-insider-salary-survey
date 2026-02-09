# Guía de Despliegue en Vercel

Este proyecto está optimizado para ser desplegado en Vercel con un solo clic.

## Pasos para el Analista:

1. **Subir a GitHub**: Asegúrate de que todos los archivos en `dashboard/` estén en un repositorio de GitHub.
2. **Importar en Vercel**: Ve a [vercel.com](https://vercel.com) e importa el repositorio.
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

## Estructura de Archivos para Despliegue:
- `dashboard/public/data/processed_data.json`: Contiene los datos procesados por el ETL.
- `dashboard/app/page.tsx`: Es el punto de entrada de la aplicación.

## Actualización de Datos:
Si necesitas actualizar con nuevos datos de Excel:
1. Ejecuta `python src/etl_process.py`.
2. Haz commit del nuevo archivo `dashboard/public/data/processed_data.json`.
3. Vercel redesplegará automáticamente.
