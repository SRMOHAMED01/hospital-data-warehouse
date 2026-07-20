import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ color: "var(--ink-soft)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--teal-deep)", fontWeight: 600 }}>
        {new Intl.NumberFormat("fr-FR").format(payload[0].value)} $
      </div>
    </div>
  );
}

export default function RevenueChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.revenueMonthly().then(setData).catch(() => setData([]));
  }, []);

  return (
    <div className="panel">
      <div className="panel__head">
        <h3 className="panel__title">Revenu mensuel</h3>
        <span className="panel__sub">/revenue/monthly</span>
      </div>
      {!data ? (
        <div className="panel__empty">Chargement…</div>
      ) : data.length === 0 ? (
        <div className="panel__empty">Aucune donnée de revenu</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="month"
              tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink-soft)" }}
              axisLine={{ stroke: "var(--line-strong)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink-soft)" }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--teal-tint)" }} />
            <Bar dataKey="total_revenue" fill="var(--teal)" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
