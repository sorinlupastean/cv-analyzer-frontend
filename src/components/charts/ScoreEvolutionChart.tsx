import React, { useMemo } from "react";
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

export type DataPoint = {
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

type Props = {
  data: DataPoint[];
  loading?: boolean;
};

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

const calcGrowthPct = (points: DataPoint[]) => {
  const cleaned = (points || []).filter((p) => Number(p?.score ?? 0) > 0);
  if (cleaned.length < 2) return 0;
  const first = Number(cleaned[0]?.score ?? 0);
  const last = Number(cleaned[cleaned.length - 1]?.score ?? 0);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) return 0;
  return Math.round(((last - first) / first) * 100);
};

export default function ScoreEvolutionChart({ data, loading }: Props) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const growth = useMemo(() => calcGrowthPct(safeData), [safeData]);
  const hasCandidatesLine = useMemo(
    () => safeData.some((p) => (p?.candidates ?? 0) > 0),
    [safeData],
  );
  const hasAnyScore = useMemo(
    () => safeData.some((p) => (p?.score ?? 0) > 0),
    [safeData],
  );

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Evoluția performanței</h3>
          <p className={styles.subtitle}>Scor mediu vs. număr candidați</p>
        </div>
        <div className={styles.badge}>
          <ArrowUpIcon />
          {loading ? "Se încarcă" : `${growth >= 0 ? "+" : ""}${growth}%`}
        </div>
      </div>

      <div className={styles.chartArea}>
        {!loading && !hasAnyScore ? (
          <div className={styles.emptyState}>
            Nu există date încă (analizează câteva CV-uri ca să apară evoluția).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeData}
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
                allowDecimals={false}
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
              {hasCandidatesLine && (
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
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

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
