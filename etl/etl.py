import pandas as pd
import os
import time
from sqlalchemy import create_engine, text

# ══════════════════════════════════════════
# CONNEXION POSTGRESQL
# Les variables viennent du docker-compose.yml
# os.getenv() lit les variables d'environnement
# ══════════════════════════════════════════
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "admin123")
DB_NAME = os.getenv("DB_NAME", "hospital_dwh")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Attendre que PostgreSQL soit prêt
# time.sleep(5) = sécurité supplémentaire
# même si le healthcheck garantit que PostgreSQL est prêt
print("⏳ Attente de PostgreSQL...")
time.sleep(5)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
print("✅ Connecté à PostgreSQL !")


# ══════════════════════════════════════════
# EXTRACT — Lire les fichiers CSV
# /app/data = le dossier data/ monté via docker-compose
# volumes: - ./data:/app/data:ro
# ══════════════════════════════════════════
print("\n📂 EXTRACT — Lecture des CSV...")

patients     = pd.read_csv("/app/data/patients.csv")
doctors      = pd.read_csv("/app/data/doctors.csv")
appointments = pd.read_csv("/app/data/appointments.csv")
treatments   = pd.read_csv("/app/data/treatments.csv")
billing      = pd.read_csv("/app/data/billing.csv")

print(f"   ✅ patients     : {len(patients)} lignes")
print(f"   ✅ doctors      : {len(doctors)} lignes")
print(f"   ✅ appointments : {len(appointments)} lignes")
print(f"   ✅ treatments   : {len(treatments)} lignes")
print(f"   ✅ billing      : {len(billing)} lignes")


# ══════════════════════════════════════════
# TRANSFORM — Nettoyer les données
# ══════════════════════════════════════════
print("\n🔧 TRANSFORM — Nettoyage des données...")

# ── Supprimer les doublons ──────────────────
# drop_duplicates() garde seulement la première occurrence
patients     = patients.drop_duplicates(subset="patient_id")
doctors      = doctors.drop_duplicates(subset="doctor_id")
appointments = appointments.drop_duplicates(subset="appointment_id")
treatments   = treatments.drop_duplicates(subset="treatment_id")
billing      = billing.drop_duplicates(subset="bill_id")

# ── Convertir les dates ─────────────────────
# errors="coerce" → date mal formatée devient NaT (null)
# au lieu de faire planter tout le script
patients["date_of_birth"]        = pd.to_datetime(patients["date_of_birth"],        errors="coerce")
patients["registration_date"]    = pd.to_datetime(patients["registration_date"],    errors="coerce")
appointments["appointment_date"] = pd.to_datetime(appointments["appointment_date"], errors="coerce")
treatments["treatment_date"]     = pd.to_datetime(treatments["treatment_date"],     errors="coerce")
billing["bill_date"]             = pd.to_datetime(billing["bill_date"],             errors="coerce")

# ── Supprimer les lignes critiques manquantes ──
# Un RDV sans patient_id ou doctor_id n'a aucun sens
# Un traitement sans coût ne peut pas être facturé
appointments = appointments.dropna(subset=["patient_id", "doctor_id"])
treatments   = treatments.dropna(subset=["appointment_id", "cost"])
billing      = billing.dropna(subset=["patient_id", "amount"])

# ── Normaliser le texte ─────────────────────
# strip() → supprime les espaces avant/après  ex: " Male " → "Male"
# upper() → met en majuscules                 ex: "m" → "M"
patients["gender"]           = patients["gender"].str.strip().str.upper()
appointments["status"]       = appointments["status"].str.strip()
billing["payment_status"]    = billing["payment_status"].str.strip()
billing["payment_method"]    = billing["payment_method"].str.strip()
treatments["treatment_type"] = treatments["treatment_type"].str.strip()

# ── Corriger les montants négatifs ──────────
# abs() → valeur absolue  ex: -3941.97 → 3941.97
# Un coût ou montant négatif n'a pas de sens dans une facture
treatments["cost"] = treatments["cost"].abs()
billing["amount"]  = billing["amount"].abs()

print("   ✅ Doublons supprimés")
print("   ✅ Dates converties")
print("   ✅ Valeurs manquantes traitées")
print("   ✅ Texte normalisé")
print("   ✅ Montants corrigés")


# ══════════════════════════════════════════
# LOAD — Charger dans PostgreSQL
# ──────────────────────────────────────────
# if_exists="append" → ajoute les données dans les tables
#                      existantes créées par schema.sql
#                      SANS supprimer les clés étrangères
#
# if_exists="replace" → NE PAS UTILISER car il supprime
#                       et recrée la table sans les clés
#                       étrangères définies dans schema.sql
#
# index=False → ne pas écrire l'index pandas (0,1,2...)
#               comme colonne dans PostgreSQL
# ══════════════════════════════════════════
print("\n📤 LOAD — Chargement dans PostgreSQL...")

# Rendre l'ETL idempotent en vidant les tables avant chargement
with engine.begin() as conn:
    print("   🧹 Nettoyage des données existantes (TRUNCATE)...")
    conn.execute(text("TRUNCATE TABLE fact_billing, fact_treatments, fact_appointments, dim_doctors, dim_patients RESTART IDENTITY CASCADE;"))

patients.to_sql("dim_patients",          engine, if_exists="append", index=False)
print("   ✅ dim_patients chargé")

doctors.to_sql("dim_doctors",            engine, if_exists="append", index=False)
print("   ✅ dim_doctors chargé")

appointments.to_sql("fact_appointments", engine, if_exists="append", index=False)
print("   ✅ fact_appointments chargé")

treatments.to_sql("fact_treatments",     engine, if_exists="append", index=False)
print("   ✅ fact_treatments chargé")

billing.to_sql("fact_billing",           engine, if_exists="append", index=False)
print("   ✅ fact_billing chargé")


print("\n🎉 ETL terminé avec succès !")
print(f"   Base : {DB_NAME}")
print(f"   Hôte : {DB_HOST}:{DB_PORT}")