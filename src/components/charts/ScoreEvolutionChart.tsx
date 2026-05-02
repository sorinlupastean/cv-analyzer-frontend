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

const numberFormatter = new Intl.NumberFormat("ro-RO");

const formatWeekLabel = (value?: string) => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^W(\d{1,2})$/i);
  if (!match) return raw;
  return `S\u0103pt. ${Number(match[1])}`;
};

const formatValue = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return numberFormatter.format(Math.round(value));
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
      <p className={styles.tooltipLabel}>{formatWeekLabel(label)}</p>
      <div className={styles.tooltipRow}>
        Scor mediu
        <span className={styles.tooltipValueScore}>{formatValue(score)}</span>
      </div>
      <div className={styles.tooltipRow}>
        {"Candida\u021bi"}
        <span className={styles.tooltipValueCandidates}>
          {formatValue(candidates)}
        </span>
      </div>
    </div>
  );
};

const calcGrowthPct = (points: DataPoint[]) => {
  const scores = (points || [])
    .map((point) => Number(point?.score ?? 0))
    .filter((value) => Number.isFinite(value));

  if (scores.length < 2) return 0;

  const splitIndex = Math.ceil(scores.length / 2);
  const previousHalf = scores.slice(0, splitIndex);
  const currentHalf = scores.slice(splitIndex);

  if (previousHalf.length === 0 || currentHalf.length === 0) return 0;

  const previousAvg =
    previousHalf.reduce((sum, value) => sum + value, 0) / previousHalf.length;
  const currentAvg =
    currentHalf.reduce((sum, value) => sum + value, 0) / currentHalf.length;

  if (previousAvg <= 0) {
    return currentAvg > 0 ? 100 : 0;
  }

  return Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
};

const normalizeData = (data: DataPoint[]) =>
  (Array.isArray(data) ? data : [])
    .map((point) => ({
      name: formatWeekLabel(point?.name),
      score: Number(point?.score ?? 0),
      candidates: Number(point?.candidates ?? 0),
    }))
    .filter(
      (point) =>
        point.name.length > 0 &&
        Number.isFinite(point.score) &&
        Number.isFinite(point.candidates),
    );

export default function ScoreEvolutionChart({ data, loading }: Props) {
  const safeData = useMemo(() => normalizeData(data), [data]);
  const growth = useMemo(() => calcGrowthPct(safeData), [safeData]);
  const hasCandidatesLine = useMemo(
    () => safeData.some((point) => (point?.candidates ?? 0) > 0),
    [safeData],
  );
  const hasAnyScore = useMemo(
    () => safeData.some((point) => (point?.score ?? 0) > 0),
    [safeData],
  );

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{"Evolu\u021bia performan\u021bei"}</h3>
          <p className={styles.subtitle}>
            {"Scor mediu vs. num\u0103r de candida\u021bi"}
          </p>
        </div>
        <div className={styles.badge}>
          <ArrowUpIcon />
          {loading ? "Se \u00eencarc\u0103" : `${growth >= 0 ? "+" : ""}${growth}%`}
        </div>
      </div>

      <div className={styles.chartArea}>
        {!loading && !hasAnyScore ? (
          <div className={styles.emptyState}>
            {"Nu exist\u0103 date \u00eenc\u0103. Analizeaz\u0103 c\u00e2teva CV-uri ca s\u0103 apar\u0103 evolu\u021bia."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeData}
              margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
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
                yAxisId="score"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, 100]}
                tickCount={6}
              />
              <YAxis
                yAxisId="candidates"
                orientation="right"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, "dataMax"]}
                tickCount={5}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#bae6fd", strokeDasharray: "5 5" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                yAxisId="score"
                stroke="none"
                fill="url(#scoreGradient)"
              />
              <Line
                type="monotone"
                dataKey="score"
                yAxisId="score"
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
                  yAxisId="candidates"
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
          {"Num\u0103r candida\u021bi"}
        </div>
      </div>
    </div>
  );
}
