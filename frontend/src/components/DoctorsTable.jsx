import { useEffect, useState } from "react";
import { api } from "../api";

function formatMoney(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " $";
}

export default function DoctorsTable() {
  const [doctors, setDoctors] = useState(null);
  const [sortKey, setSortKey] = useState("total_revenue");

  useEffect(() => {
    api.doctorsTop().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  const sorted = doctors
    ? [...doctors].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0))
    : null;

  return (
    <div className="panel">
      <div className="panel__head">
        <h3 className="panel__title">Médecins</h3>
        <span className="panel__sub">/doctors/top</span>
      </div>
      {!sorted ? (
        <div className="panel__empty">Chargement…</div>
      ) : sorted.length === 0 ? (
        <div className="panel__empty">Aucun médecin</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="dtable">
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Spécialisation</th>
                <th>Antenne</th>
                <th
                  className="num"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSortKey("years_experience")}
                >
                  Expérience
                </th>
                <th
                  className="num"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSortKey("total_appointments")}
                >
                  RDV
                </th>
                <th
                  className="num"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSortKey("total_revenue")}
                >
                  Revenu
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.doctor_id}>
                  <td>{d.full_name}</td>
                  <td>
                    <span className="pill pill--teal">{d.specialization}</span>
                  </td>
                  <td>{d.hospital_branch}</td>
                  <td className="num">{d.years_experience} ans</td>
                  <td className="num">{d.total_appointments}</td>
                  <td className="num">{formatMoney(d.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
