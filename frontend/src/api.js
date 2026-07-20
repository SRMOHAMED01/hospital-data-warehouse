// ══════════════════════════════════════════
// URL de base de l'API FastAPI.
// En dev : http://localhost:8000 (voir docker-compose.yml)
// Peut être surchargée avec un fichier .env :
//   VITE_API_URL=http://localhost:8000
// ══════════════════════════════════════════
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Erreur API ${path} : ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ══════════════════════════════════════════
// Un export par route de api.py.
// Chaque fonction correspond exactement à
// un endpoint défini côté backend.
// ══════════════════════════════════════════
export const api = {
  ping: () => get("/"),
  kpis: () => get("/kpis"),
  revenueMonthly: () => get("/revenue/monthly"),
  revenueByPaymentMethod: () => get("/revenue/by-payment-method"),
  billingStatus: () => get("/billing/status"),
  patientsMonthly: () => get("/patients/monthly"),
  patientsByInsurance: () => get("/patients/by-insurance"),
  patientsByGender: () => get("/patients/by-gender"),
  treatmentsTop: () => get("/treatments/top"),
  treatmentsMonthly: () => get("/treatments/monthly"),
  appointmentsStatus: () => get("/appointments/status"),
  appointmentsMonthly: () => get("/appointments/monthly"),
  doctorsTop: () => get("/doctors/top"),
  doctorsBySpecialization: () => get("/doctors/by-specialization"),
};
