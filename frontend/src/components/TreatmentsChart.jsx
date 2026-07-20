import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api";

export default function TreatmentsChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.treatmentsTop().then(setData).catch(() => setData([]));
  }, []);

  return (
    <div className="panel">
      <div className="panel__head">
        <h3 className="panel__title">Traitements les plus fréquents</h3>
        <span className="panel__sub">/treatments/top</span>
      </div>
      {!data ? (
        <div className="panel__empty">Chargement…</div>
      ) : data.length === 0 ? (
        <div className="panel__empty">Aucune donnée</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--line)" />
            <XAxis
              type="number"
              tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink-soft)" }}
              axisLine={{ stroke: "var(--line-strong)" }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="treatment_type"
              tick={{ fontFamily: "var(--font-body)", fontSize: 12, fill: "var(--ink)" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              cursor={{ fill: "var(--teal-tint)" }}
              contentStyle={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                border: "1px solid var(--line-strong)",
                borderRadius: 8,
              }}
              formatter={(value, name) =>
                name === "total" ? [value, "Occurrences"] : [`${value} $`, "Coût moyen"]
              }
            />
            <Bar dataKey="total" fill="var(--amber)" radius={[0, 3, 3, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
