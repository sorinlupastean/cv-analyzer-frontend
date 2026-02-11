import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";

import styles from "./ScoreEvolutionChart.module.css";

// SVG Arrow Inline (ca să nu mai depindem de import extern dacă nu există)
const ArrowUpIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type DataPoint = {
  name: string;
  score: number;
  candidates: number;
};

const data: DataPoint[] = [
  { name: "Jan", score: 72, candidates: 50 },
  { name: "Feb", score: 75, candidates: 54 },
  { name: "Mar", score: 78, candidates: 57 },
  { name: "Apr", score: 85, candidates: 66 },
  { name: "May", score: 87, candidates: 72 },
  { name: "Jun", score: 90, candidates: 80 },
  { name: "Jul", score: 92, candidates: 81 },
  { name: "Aug", score: 89, candidates: 79 },
  { name: "Sep", score: 93, candidates: 87 },
  { name: "Oct", score: 96, candidates: 95 },
  { name: "Nov", score: 100, candidates: 110 },
  { name: "Dec", score: 118, candidates: 128 },
];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const score = payload.find((p: any) => p.dataKey === "score")?.value;
  const candidates = payload.find(
    (p: any) => p.dataKey === "candidates",
  )?.value;

  return (
    <div className={styles.tooltipBox}>
      <p className={styles.tooltipLabel}>{label}</p>
      <div className={styles.tooltipRow}>
        Scor Mediu: <span style={{ color: "#06b6d4" }}>{score}</span>
      </div>
      <div className={styles.tooltipRow}>
        Candidați: <span style={{ color: "#93c5fd" }}>{candidates}</span>
      </div>
    </div>
  );
};

export default function ScoreEvolutionChart() {
  return (
    <div className={styles.chartWrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Evoluția Performanței</h3>
          <p className={styles.subtitle}>Scor mediu vs. Număr candidați</p>
        </div>

        <div className={styles.badge}>
          <ArrowUpIcon />
          +22% Creștere
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="75%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Gradient Cyan pentru zona de sub linie */}
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Linii de ghidaj foarte fine */}
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#bae6fd", strokeDasharray: "5 5" }}
          />

          {/* ZONA UMPLUTĂ (Scor) */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="url(#scoreGradient)"
          />

          {/* LINIA PRINCIPALĂ (Scor - Cyan Electric) */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="#06b6d4" /* Cyan-500 */
            strokeWidth={3}
            dot={{ r: 4, fill: "#fff", stroke: "#06b6d4", strokeWidth: 2 }}
            activeDot={{
              r: 6,
              fill: "#06b6d4",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />

          {/* LINIA SECUNDARĂ (Candidați - Albastru Deschis) */}
          <Line
            type="monotone"
            dataKey="candidates"
            stroke="#93c5fd" /* Blue-300 */
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: "#93c5fd" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* LEGENDĂ */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#06b6d4" }} />
          Scor Mediu
        </div>

        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#93c5fd" }} />
          Volum Candidați
        </div>
      </div>
    </div>
  );
}
