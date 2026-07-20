-- ══════════════════════════════════════════
-- NETTOYAGE
-- Si les tables existent déjà, on les supprime
-- Utile quand tu relances le projet depuis zéro
-- L'ordre est important : supprimer d'abord les tables
-- qui dépendent des autres (les facts avant les dims)
-- ══════════════════════════════════════════

DROP TABLE IF EXISTS fact_billing;
DROP TABLE IF EXISTS fact_treatments;
DROP TABLE IF EXISTS fact_appointments;
DROP TABLE IF EXISTS dim_doctors;
DROP TABLE IF EXISTS dim_patients;


-- ══════════════════════════════════════════
-- DIMENSION PATIENTS
-- Contient les informations sur chaque patient
-- Source : patients.csv
-- ══════════════════════════════════════════

CREATE TABLE dim_patients (
    patient_id          VARCHAR(10)  PRIMARY KEY,  -- Identifiant unique ex: P001
    first_name          VARCHAR(50),               -- Prénom
    last_name           VARCHAR(50),               -- Nom
    gender              VARCHAR(5),                -- M ou F
    date_of_birth       DATE,                      -- Ex: 1955-06-04
    contact_number      VARCHAR(20),               -- Numéro de téléphone
    address             VARCHAR(200),              -- Adresse complète
    registration_date   DATE,                      -- Date d'inscription à l'hôpital
    insurance_provider  VARCHAR(50),               -- Nom de l'assurance ex: WellnessCorp
    insurance_number    VARCHAR(20),               -- Numéro de police d'assurance
    email               VARCHAR(100)               -- Email du patient
);


-- ══════════════════════════════════════════
-- DIMENSION DOCTORS
-- Contient les informations sur chaque médecin
-- Source : doctors.csv
-- ══════════════════════════════════════════

CREATE TABLE dim_doctors (
    doctor_id           VARCHAR(10)  PRIMARY KEY,  -- Identifiant unique ex: D001
    first_name          VARCHAR(50),               -- Prénom
    last_name           VARCHAR(50),               -- Nom
    specialization      VARCHAR(100),              -- Ex: Cardiology, Dermatology
    phone_number        VARCHAR(20),               -- Numéro de téléphone
    years_experience    INT,                       -- Nombre d'années d'expérience
    hospital_branch     VARCHAR(100),              -- Ex: Westside Clinic, Main Hospital
    email               VARCHAR(100)               -- Email professionnel
);


-- ══════════════════════════════════════════
-- FAIT APPOINTMENTS (Rendez-vous)
-- Chaque ligne = un rendez-vous entre un patient et un médecin
-- Fait le lien entre dim_patients et dim_doctors
-- Source : appointments.csv
-- ══════════════════════════════════════════

CREATE TABLE fact_appointments (
    appointment_id      VARCHAR(10)  PRIMARY KEY,  -- Identifiant unique ex: A001
    patient_id          VARCHAR(10)  REFERENCES dim_patients(patient_id),
                                                   -- Clé étrangère → dim_patients
                                                   -- garantit que le patient existe
    doctor_id           VARCHAR(10)  REFERENCES dim_doctors(doctor_id),
                                                   -- Clé étrangère → dim_doctors
                                                   -- garantit que le médecin existe
    appointment_date    DATE,                      -- Date du rendez-vous
    appointment_time    TIME,                      -- Heure ex: 15:15:00
    reason_for_visit    VARCHAR(200),              -- Motif ex: Therapy, Chest Pain
    status              VARCHAR(20)                -- Ex: Scheduled, Completed, No-show
);


-- ══════════════════════════════════════════
-- FAIT TREATMENTS (Traitements)
-- Chaque ligne = un traitement lié à un rendez-vous
-- Source : treatments.csv
-- ══════════════════════════════════════════

CREATE TABLE fact_treatments (
    treatment_id        VARCHAR(10)  PRIMARY KEY,  -- Identifiant unique ex: T001
    appointment_id      VARCHAR(10)  REFERENCES fact_appointments(appointment_id),
                                                   -- Clé étrangère → fact_appointments
                                                   -- un traitement est toujours lié à un RDV
    treatment_type      VARCHAR(100),              -- Ex: Chemotherapy, MRI, ECG
    description         VARCHAR(200),              -- Ex: Basic screening, Advanced protocol
    cost                DECIMAL(10,2),             -- Coût en dollars ex: 3941.97
    treatment_date      DATE                       -- Date du traitement
);


-- ══════════════════════════════════════════
-- FAIT BILLING (Facturation)
-- Chaque ligne = une facture liée à un patient et un traitement
-- C'est ici qu'on calcule les revenus de l'hôpital
-- Source : billing.csv
-- ══════════════════════════════════════════

CREATE TABLE fact_billing (
    bill_id             VARCHAR(10)  PRIMARY KEY,  -- Identifiant unique ex: B001
    patient_id          VARCHAR(10)  REFERENCES dim_patients(patient_id),
                                                   -- Clé étrangère → dim_patients
    treatment_id        VARCHAR(10)  REFERENCES fact_treatments(treatment_id),
                                                   -- Clé étrangère → fact_treatments
    bill_date           DATE,                      -- Date de la facture
    amount              DECIMAL(10,2),             -- Montant facturé ex: 3941.97
    payment_method      VARCHAR(50),               -- Ex: Insurance, Cash, Card
    payment_status      VARCHAR(20)                -- Ex: Paid, Pending, Cancelled
);