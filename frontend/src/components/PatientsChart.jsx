import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "../api";

const GENDER_COLORS = { M: "var(--teal)", F: "var(--amber)" };
const FALLBACK_COLORS = ["var(--teal)", "var(--amber)", "var(--sage)", "var(--coral)"];

export default function PatientsChart() {
  const [monthly, setMonthly] = useState(null);
  const [gender, setGender] = useState(null);

  useEffect(() => {
    api.patientsMonthly().then(setMonthly).catch(() => setMonthly([]));
    api.patientsByGender().then(setGender).catch(() => setGender([]));
  }, []);

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel__head">
          <h3 className="panel__title">Nouveaux patients / mois</h3>
          <span className="panel__sub">/patients/monthly</span>
        </div>
        {!monthly ? (
          <div className="panel__empty">Chargement…</div>
        ) : monthly.length === 0 ? (
          <div className="panel__empty">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
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
                width={40}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="new_patients"
                stroke="var(--teal)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--teal)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <div className="panel__head">
          <h3 className="panel__title">Répartition par genre</h3>
          <span className="panel__sub">/patients/by-gender</span>
        </div>
        {!gender ? (
          <div className="panel__empty">Chargement…</div>
        ) : gender.length === 0 ? (
          <div className="panel__empty">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={gender}
                dataKey="total"
                nameKey="gender"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
              >
                {gender.map((entry, i) => (
                  <Cell
                    key={entry.gender}
                    fill={GENDER_COLORS[entry.gender] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                  />
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
                height={24}
                wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
