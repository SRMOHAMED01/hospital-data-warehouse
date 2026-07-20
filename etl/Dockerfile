# ══════════════════════════════════════════
# IMAGE DE BASE Python légère
# Dédiée au service ETL (chargement CSV -> PostgreSQL)
# ══════════════════════════════════════════
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ══════════════════════════════════════════
# Ce conteneur ne fait qu'une chose :
# exécuter l'ETL une fois, puis s'arrêter
# ══════════════════════════════════════════
CMD ["python", "etl.py"]