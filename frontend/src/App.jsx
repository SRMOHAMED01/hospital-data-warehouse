import { useEffect, useState } from "react";
import { api } from "./api";

import KpiCards from "./components/KpiCards";
import RevenueChart from "./components/RevenueChart";
import PatientsChart from "./components/PatientsChart";
import TreatmentsChart from "./components/TreatmentsChart";
import AppointmentsChart from "./components/AppointmentsChart";
import DoctorsTable from "./components/DoctorsTable";
import BillingTable from "./components/BillingTable";

export default function App() {
  // "unknown" -> "live" ou "down" une fois le ping de l'API résolu
  const [apiStatus, setApiStatus] = useState("unknown");

  useEffect(() => {
    api
      .ping()
      .then(() => setApiStatus("live"))
      .catch(() => setApiStatus("down"));
  }, []);

  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="topbar__title">
          Hospital <span>DWH</span>
        </h1>
        <div className="topbar__meta">
          <span
            className={`status-dot ${
              apiStatus === "live" ? "is-live" : apiStatus === "down" ? "is-down" : ""
            }`}
          />
          {apiStatus === "live" && "API connectée"}
          {apiStatus === "down" && "API injoignable"}
          {apiStatus === "unknown" && "Connexion…"}
          <span style={{ opacity: 0.5 }}>·</span>
          {today}
        </div>
      </header>

      <section className="section">
        <p className="section__eyebrow">Vue d'ensemble</p>
        <h2 className="section__title">Signes vitaux de l'hôpital</h2>
        <KpiCards />
      </section>

      <section className="section">
        <p className="section__eyebrow">Finances</p>
        <h2 className="section__title">Revenu &amp; facturation</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <RevenueChart />
          <BillingTable />
        </div>
      </section>

      <section className="section">
        <p className="section__eyebrow">Activité clinique</p>
        <h2 className="section__title">Patients, traitements &amp; rendez-vous</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <PatientsChart />
          <div className="grid-2">
            <TreatmentsChart />
            <AppointmentsChart />
          </div>
        </div>
      </section>

      <section className="section">
        <p className="section__eyebrow">Personnel</p>
        <h2 className="section__title">Médecins</h2>
        <DoctorsTable />
      </section>
    </div>
  );
}
