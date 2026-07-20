import { useEffect, useState } from "react";
import { api } from "../api";

function formatMoney(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " $";
}

const STATUS_PILL = {
  Paid: "pill--sage",
  Pending: "pill--amber",
  Cancelled: "pill--coral",
};

export default function BillingTable() {
  const [status, setStatus] = useState(null);
  const [byMethod, setByMethod] = useState(null);

  useEffect(() => {
    api.billingStatus().then(setStatus).catch(() => setStatus([]));
    api.revenueByPaymentMethod().then(setByMethod).catch(() => setByMethod([]));
  }, []);

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel__head">
          <h3 className="panel__title">Factures par statut</h3>
          <span className="panel__sub">/billing/status</span>
        </div>
        {!status ? (
          <div className="panel__empty">Chargement…</div>
        ) : status.length === 0 ? (
          <div className="panel__empty">Aucune facture</div>
        ) : (
          <table className="dtable">
            <thead>
              <tr>
                <th>Statut</th>
                <th className="num">Nombre</th>
                <th className="num">Montant</th>
              </tr>
            </thead>
            <tbody>
              {status.map((s) => (
                <tr key={s.payment_status}>
                  <td>
                    <span className={`pill ${STATUS_PILL[s.payment_status] || "pill--ink"}`}>
                      {s.payment_status}
                    </span>
                  </td>
                  <td className="num">{s.total}</td>
                  <td className="num">{formatMoney(s.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel__head">
          <h3 className="panel__title">Par méthode de paiement</h3>
          <span className="panel__sub">/revenue/by-payment-method</span>
        </div>
        {!byMethod ? (
          <div className="panel__empty">Chargement…</div>
        ) : byMethod.length === 0 ? (
          <div className="panel__empty">Aucune donnée</div>
        ) : (
          <table className="dtable">
            <thead>
              <tr>
                <th>Méthode</th>
                <th className="num">Factures</th>
                <th className="num">Revenu</th>
              </tr>
            </thead>
            <tbody>
              {byMethod.map((m) => (
                <tr key={m.payment_method}>
                  <td>{m.payment_method}</td>
                  <td className="num">{m.total_bills}</td>
                  <td className="num">{formatMoney(m.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
