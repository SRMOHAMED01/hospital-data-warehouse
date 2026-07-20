import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "../api";

// Couleurs sémantiques par statut de rendez-vous
const STATUS_COLORS = {
  Scheduled: "var(--teal)",
  Completed: "var(--sage)",
  "No-show": "var(--amber)",
  Cancelled: "var(--coral)",
};
const FALLBACK = "var(--ink-faint)";

export default function AppointmentsChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.appointmentsStatus().then(setData).catch(() => setData([]));
  }, []);

  const total = data?.reduce((sum, d) => sum + d.total, 0) ?? 0;

  return (
    <div className="panel">
      <div className="panel__head">
        <h3 className="panel__title">Rendez-vous par statut</h3>
        <span className="panel__sub">/appointments/status</span>
      </div>
      {!data ? (
        <div className="panel__empty">Chargement…</div>
      ) : data.length === 0 ? (
        <div className="panel__empty">Aucune donnée</div>
      ) : (
        <div style={{ position: "relative" }}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="status"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || FALLBACK} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600 }}>{total}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)" }}>
              total
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
