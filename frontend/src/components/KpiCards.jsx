import { useEffect, useState } from "react";
import { api } from "../api";

// Formatage monétaire compact : 1234567 -> "1,234,567 $"
function formatMoney(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " $";
}

function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR").format(value);
}

export default function KpiCards() {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .kpis()
      .then(setKpis)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="panel__empty">Impossible de charger les KPIs — {error}</div>;
  }

  // Squelette de chargement : évite un layout qui saute une fois les données arrivées
  const cards = [
    { key: "total_patients", label: "Patients", accent: "var(--teal)", value: kpis?.total_patients, fmt: formatNumber },
    { key: "total_doctors", label: "Médecins", accent: "var(--teal)", value: kpis?.total_doctors, fmt: formatNumber },
    { key: "total_appointments", label: "Rendez-vous", accent: "var(--teal)", value: kpis?.total_appointments, fmt: formatNumber },
    { key: "total_revenue", label: "Revenu total", accent: "var(--sage)", value: kpis?.total_revenue, fmt: formatMoney },
    { key: "paid_bills", label: "Factures payées", accent: "var(--sage)", value: kpis?.paid_bills, fmt: formatNumber },
    { key: "pending_bills", label: "Factures en attente", accent: "var(--amber)", value: kpis?.pending_bills, fmt: formatNumber },
    { key: "avg_treatment_cost", label: "Coût moyen traitement", accent: "var(--teal)", value: kpis?.avg_treatment_cost, fmt: formatMoney },
  ];

  return (
    <div className="vitals">
      {cards.map((c) => (
        <div className="vital" key={c.key} style={{ "--accent": c.accent }}>
          <p className="vital__label">{c.label}</p>
          <div className="vital__value">{kpis ? c.fmt(c.value) : "···"}</div>
        </div>
      ))}
    </div>
  );
}
