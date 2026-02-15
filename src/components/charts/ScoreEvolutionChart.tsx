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

/* =========================
   INLINE ICON (NO ASSET DEP)
   ========================= */
const ArrowUpIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
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

/* =========================
   TYPES
   ========================= */
type DataPoint = {
  name: string;
  score: number;
  candidates: number;
};

type TooltipPayloadItem = {
  dataKey?: string;
  value?: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

/* =========================
   MOCK DATA (REPLACE LATER)
   ========================= */
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

/* =========================
   TOOLTIP
   ========================= */
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const score = payload.find((p) => p.dataKey === "score")?.value;
  const candidates = payload.find((p) => p.dataKey === "candidates")?.value;

  return (
    <div className={styles.tooltipBox}>
      <p className={styles.tooltipLabel}>{label ?? ""}</p>

      <div className={styles.tooltipRow}>
        Scor mediu:
        <span className={styles.tooltipValueScore}>{score ?? "-"}</span>
      </div>

      <div className={styles.tooltipRow}>
        Candidați:
        <span className={styles.tooltipValueCandidates}>
          {candidates ?? "-"}
        </span>
      </div>
    </div>
  );
};

/* =========================
   COMPONENT
   ========================= */
export default function ScoreEvolutionChart() {
  return (
    <div className={styles.chartWrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Evoluția performanței</h3>
          <p className={styles.subtitle}>Scor mediu vs. număr candidați</p>
        </div>

        <div className={styles.badge}>
          <ArrowUpIcon />
          +22% creștere
        </div>
      </div>

      {/* CHART */}
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>

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

            <Area
              type="monotone"
              dataKey="score"
              stroke="none"
              fill="url(#scoreGradient)"
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4, fill: "#fff", stroke: "#0ea5e9", strokeWidth: 2 }}
              activeDot={{
                r: 6,
                fill: "#0ea5e9",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive
            />

            <Line
              type="monotone"
              dataKey="candidates"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "#60a5fa" }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#0ea5e9" }} />
          Scor mediu
        </div>

        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#60a5fa" }} />
          Volum candidați
        </div>
      </div>
    </div>
  );
}
