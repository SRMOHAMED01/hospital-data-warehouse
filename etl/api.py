from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import os

# ══════════════════════════════════════════
# CONNEXION POSTGRESQL
# Mêmes variables que dans etl.py
# ══════════════════════════════════════════
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "admin123")
DB_NAME = os.getenv("DB_NAME", "hospital_dwh")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_pre_ping=True
)

# ══════════════════════════════════════════
# INSTANCE FASTAPI
# ══════════════════════════════════════════
app = FastAPI(
    title="Hospital Data Warehouse API",
    description="API pour le dashboard hospitalier",
    version="1.0.0"
)

# ══════════════════════════════════════════
# CORS
# Permet au frontend React (localhost:5173)
# de faire des requêtes vers l'API (localhost:8000)
# Sans ça → le navigateur bloque les requêtes
# ══════════════════════════════════════════
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════
# FONCTION UTILITAIRE
# Exécute une requête SQL et retourne
# les résultats sous forme de liste de dicts
# ══════════════════════════════════════════
def query(sql):
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        rows = result.fetchall()
        keys = result.keys()
        return [dict(zip(keys, row)) for row in rows]


# ══════════════════════════════════════════
# ROUTE DE BASE
# Vérifie que l'API tourne
# http://localhost:8000/
# ══════════════════════════════════════════
@app.get("/")
def root():
    return {"message": "Hospital DWH API is running ✅"}


# ══════════════════════════════════════════
# KPI CARDS — chiffres clés pour le dashboard
# http://localhost:8000/kpis
# Retourne tous les KPIs en une seule requête
# ══════════════════════════════════════════
@app.get("/kpis")
def get_kpis():
    return {

        # Nombre total de patients distincts
        "total_patients": query("""
            SELECT COUNT(DISTINCT patient_id) AS total
            FROM dim_patients
        """)[0]["total"],

        # Nombre total de médecins
        "total_doctors": query("""
            SELECT COUNT(*) AS total
            FROM dim_doctors
        """)[0]["total"],

        # Nombre total de rendez-vous
        "total_appointments": query("""
            SELECT COUNT(*) AS total
            FROM fact_appointments
        """)[0]["total"],

        # Revenu total (somme de toutes les factures)
        "total_revenue": query("""
            SELECT ROUND(SUM(amount)::numeric, 2) AS total
            FROM fact_billing
        """)[0]["total"],

        # Factures payées
        "paid_bills": query("""
            SELECT COUNT(*) AS total
            FROM fact_billing
            WHERE payment_status = 'Paid'
        """)[0]["total"],

        # Factures en attente
        "pending_bills": query("""
            SELECT COUNT(*) AS total
            FROM fact_billing
            WHERE payment_status = 'Pending'
        """)[0]["total"],

        # Coût moyen d'un traitement
        "avg_treatment_cost": query("""
            SELECT ROUND(AVG(cost)::numeric, 2) AS avg
            FROM fact_treatments
        """)[0]["avg"],
    }


# ══════════════════════════════════════════
# REVENUS PAR MOIS
# http://localhost:8000/revenue/monthly
# Pour le graphique courbe/barre du dashboard
# ══════════════════════════════════════════
@app.get("/revenue/monthly")
def revenue_monthly():
    return query("""
        SELECT
            TO_CHAR(bill_date, 'YYYY-MM') AS month,
            ROUND(SUM(amount)::numeric, 2) AS total_revenue,
            COUNT(*) AS total_bills
        FROM fact_billing
        GROUP BY TO_CHAR(bill_date, 'YYYY-MM')
        ORDER BY month
    """)


# ══════════════════════════════════════════
# REVENUS PAR MÉTHODE DE PAIEMENT
# http://localhost:8000/revenue/by-payment-method
# Pour le pie chart billing
# ══════════════════════════════════════════
@app.get("/revenue/by-payment-method")
def revenue_by_payment():
    return query("""
        SELECT
            payment_method,
            COUNT(*) AS total_bills,
            ROUND(SUM(amount)::numeric, 2) AS total_revenue
        FROM fact_billing
        GROUP BY payment_method
        ORDER BY total_revenue DESC
    """)


# ══════════════════════════════════════════
# STATUT DES PAIEMENTS
# http://localhost:8000/billing/status
# Paid / Pending / Cancelled
# ══════════════════════════════════════════
@app.get("/billing/status")
def billing_status():
    return query("""
        SELECT
            payment_status,
            COUNT(*) AS total,
            ROUND(SUM(amount)::numeric, 2) AS total_amount
        FROM fact_billing
        GROUP BY payment_status
        ORDER BY total DESC
    """)


# ══════════════════════════════════════════
# PATIENTS PAR MOIS D'INSCRIPTION
# http://localhost:8000/patients/monthly
# ══════════════════════════════════════════
@app.get("/patients/monthly")
def patients_monthly():
    return query("""
        SELECT
            TO_CHAR(registration_date, 'YYYY-MM') AS month,
            COUNT(*) AS new_patients
        FROM dim_patients
        GROUP BY TO_CHAR(registration_date, 'YYYY-MM')
        ORDER BY month
    """)


# ══════════════════════════════════════════
# PATIENTS PAR ASSURANCE
# http://localhost:8000/patients/by-insurance
# ══════════════════════════════════════════
@app.get("/patients/by-insurance")
def patients_by_insurance():
    return query("""
        SELECT
            insurance_provider,
            COUNT(*) AS total_patients
        FROM dim_patients
        GROUP BY insurance_provider
        ORDER BY total_patients DESC
    """)


# ══════════════════════════════════════════
# PATIENTS PAR GENRE
# http://localhost:8000/patients/by-gender
# ══════════════════════════════════════════
@app.get("/patients/by-gender")
def patients_by_gender():
    return query("""
        SELECT
            gender,
            COUNT(*) AS total
        FROM dim_patients
        GROUP BY gender
    """)


# ══════════════════════════════════════════
# TOP TRAITEMENTS PAR FRÉQUENCE
# http://localhost:8000/treatments/top
# ══════════════════════════════════════════
@app.get("/treatments/top")
def top_treatments():
    return query("""
        SELECT
            treatment_type,
            COUNT(*) AS total,
            ROUND(AVG(cost)::numeric, 2) AS avg_cost,
            ROUND(SUM(cost)::numeric, 2) AS total_revenue
        FROM fact_treatments
        GROUP BY treatment_type
        ORDER BY total DESC
    """)


# ══════════════════════════════════════════
# TRAITEMENTS PAR MOIS
# http://localhost:8000/treatments/monthly
# ══════════════════════════════════════════
@app.get("/treatments/monthly")
def treatments_monthly():
    return query("""
        SELECT
            TO_CHAR(treatment_date, 'YYYY-MM') AS month,
            COUNT(*) AS total_treatments,
            ROUND(SUM(cost)::numeric, 2) AS total_cost
        FROM fact_treatments
        GROUP BY TO_CHAR(treatment_date, 'YYYY-MM')
        ORDER BY month
    """)


# ══════════════════════════════════════════
# RENDEZ-VOUS PAR STATUT
# http://localhost:8000/appointments/status
# Scheduled / Completed / No-show / Cancelled
# ══════════════════════════════════════════
@app.get("/appointments/status")
def appointments_status():
    return query("""
        SELECT
            status,
            COUNT(*) AS total
        FROM fact_appointments
        GROUP BY status
        ORDER BY total DESC
    """)


# ══════════════════════════════════════════
# RENDEZ-VOUS PAR MOIS
# http://localhost:8000/appointments/monthly
# ══════════════════════════════════════════
@app.get("/appointments/monthly")
def appointments_monthly():
    return query("""
        SELECT
            TO_CHAR(appointment_date, 'YYYY-MM') AS month,
            COUNT(*) AS total_appointments
        FROM fact_appointments
        GROUP BY TO_CHAR(appointment_date, 'YYYY-MM')
        ORDER BY month
    """)


# ══════════════════════════════════════════
# TOP MÉDECINS PAR NOMBRE DE RENDEZ-VOUS
# http://localhost:8000/doctors/top
# ══════════════════════════════════════════
@app.get("/doctors/top")
def top_doctors():
    return query("""
        SELECT
            d.doctor_id,
            d.first_name || ' ' || d.last_name AS full_name,
            d.specialization,
            d.hospital_branch,
            d.years_experience,
            COUNT(a.appointment_id) AS total_appointments,
            ROUND(SUM(b.amount)::numeric, 2) AS total_revenue
        FROM dim_doctors d
        LEFT JOIN fact_appointments a ON d.doctor_id = a.doctor_id
        LEFT JOIN fact_billing b ON a.patient_id = b.patient_id
        GROUP BY d.doctor_id, d.first_name, d.last_name,
                 d.specialization, d.hospital_branch, d.years_experience
        ORDER BY total_revenue DESC
    """)


# ══════════════════════════════════════════
# MÉDECINS PAR SPÉCIALISATION
# http://localhost:8000/doctors/by-specialization
# ══════════════════════════════════════════
@app.get("/doctors/by-specialization")
def doctors_by_specialization():
    return query("""
        SELECT
            specialization,
            COUNT(*) AS total_doctors
        FROM dim_doctors
        GROUP BY specialization
        ORDER BY total_doctors DESC
    """)
