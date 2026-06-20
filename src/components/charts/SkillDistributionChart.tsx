import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "./SkillDistributionChart.module.css";

export type SkillPoint = {
  name: string;
  value: number;
};

type SkillDatum = {
  name: string;
  count: number;
  share: number;
  color: string;
};

type Props = {
  data: SkillPoint[];
  loading?: boolean;
};

const COLORS = [
  "#0ea5e9",
  "#60a5fa",
  "#22d3ee",
  "#6366f1",
  "#2dd4bf",
  "#38bdf8",
  "#818cf8",
  "#14b8a6",
  "#93c5fd",
  "#67e8f9",
];

const percentFormatter = new Intl.NumberFormat("ro-RO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const countFormatter = new Intl.NumberFormat("ro-RO");

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    obs.observe(ref.current);
    setWidth(ref.current.clientWidth);

    return () => obs.disconnect();
  }, [ref]);

  return width;
}

const normalizeSkillKey = (value: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_/.-]+/g, " ")
    .replace(/\s+/g, " ");

const displayAliases: Record<string, string> = {
  comunicare: "Comunicare",
  communication: "Comunicare",
  teamwork: "Lucru în echipă",
  "team work": "Lucru în echipă",
  colaborare: "Lucru în echipă",
  organizare: "Organizare",
  organization: "Organizare",
  "organizational skills": "Organizare",
  "problem solving": "Rezolvare de probleme",
  adaptabilitate: "Adaptabilitate",
  adaptability: "Adaptabilitate",
  leadership: "Leadership",
  creativitate: "Creativitate",
  creativity: "Creativitate",
  figma: "Figma",
  css: "CSS",
  html: "HTML",
  sql: "SQL",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  angular: "Angular",
  vue: "Vue",
  nodejs: "Node.js",
  nestjs: "NestJS",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
};

const formatSkillName = (value: string) => {
  const compact = String(value ?? "").trim();
  if (!compact) return "";

  const normalized = normalizeSkillKey(compact);
  const alias = displayAliases[normalized];
  if (alias) return alias;

  if (compact === compact.toUpperCase() && compact.length <= 8) {
    return compact;
  }

  return compact
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^[A-Z0-9+/#.-]+$/.test(part)) return part;
      return part.charAt(0).toLocaleUpperCase("ro-RO") + part.slice(1);
    })
    .join(" ");
};

export default function SkillDistributionChart({ data, loading }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  const isStacked = containerWidth > 0 && containerWidth < 500;
  const chartSideWidth = isStacked ? containerWidth : containerWidth * 0.46;
  const pieSize = Math.min(chartSideWidth, 220);
  const outerRadius = Math.max(pieSize * 0.42, 40);
  const innerRadius = Math.max(outerRadius * 0.68, 28);
  const bubbleSize = Math.max(innerRadius * 1.6, 56);

  const chartData: SkillDatum[] = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];
    const aggregates = new Map<string, { name: string; count: number }>();

    for (const item of safe) {
      const rawName = formatSkillName(String(item?.name ?? ""));
      const count = Math.max(0, Math.round(Number(item?.value ?? 0)));

      if (!rawName || !Number.isFinite(count) || count <= 0) continue;

      const key = normalizeSkillKey(rawName);
      const current = aggregates.get(key);

      if (current) {
        current.count += count;
      } else {
        aggregates.set(key, { name: rawName, count });
      }
    }

    const sorted = Array.from(aggregates.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "ro-RO");
    });

    const top = sorted.slice(0, 5);
    const total = top.reduce((sum, item) => sum + item.count, 0);

    if (total <= 0) return [];

    return top.map((item, index) => ({
      name: item.name,
      count: item.count,
      share: Math.round((item.count / total) * 1000) / 10,
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  useEffect(() => {
    setActiveIndex(chartData.length > 0 ? 0 : null);
  }, [chartData]);

  const activeData = useMemo(() => {
    if (activeIndex === null) return chartData[0] ?? null;
    return chartData[activeIndex] ?? chartData[0] ?? null;
  }, [activeIndex, chartData]);

  const totalCount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.count, 0),
    [chartData],
  );

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Distribuția abilităților</h3>
          <p className={styles.subtitle}>Top competențe identificate</p>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          {loading ? "Se încarcă" : "Live"}
        </div>
      </div>

      <div
        className={`${styles.content} ${isStacked ? styles.contentStacked : ""}`}
      >
        {!loading && chartData.length === 0 && (
          <div className={styles.emptyStateOverlay} aria-live="polite">
            <div className={styles.emptyState}>
              <span className={styles.emptyStateLead}>
                {"Nu există suficiente date încă."}
              </span>
              <span className={styles.emptyStateSub}>
                {"Analizează câteva CV-uri ca să apară distribuția competențelor."}
              </span>
            </div>
          </div>
        )}

        <div className={styles.chartSide}>
          <div className={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="share"
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={4}
                  cornerRadius={7}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(0)}
                  stroke="none"
                  isAnimationActive={!loading}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      fillOpacity={
                        activeIndex === null || activeIndex === index ? 1 : 0.28
                      }
                      stroke={activeIndex === index ? "#ffffff" : "none"}
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {activeData && (
              <div
                className={styles.centerBubble}
                aria-live="polite"
                style={{ width: bubbleSize, height: bubbleSize }}
              >
                <span className={styles.centerLabel}>{activeData.name}</span>
                <span
                  className={styles.centerValue}
                  style={{ color: activeData.color }}
                >
                  {percentFormatter.format(activeData.share)}%
                </span>
                <span className={styles.centerCaption}>
                  {countFormatter.format(activeData.count)} apariții
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.legendSide}>
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className={`${styles.legendRow} ${index === activeIndex ? styles.active : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(0)}
              role="button"
              tabIndex={0}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(0)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveIndex(index);
                if (e.key === "Escape") setActiveIndex(0);
              }}
              aria-label={`${item.name}: ${percentFormatter.format(item.share)}% (${countFormatter.format(item.count)} apariții)`}
            >
              <div className={styles.rowTop}>
                <div className={styles.left}>
                  <span
                    className={styles.dot}
                    style={{ background: item.color }}
                  />
                  <span className={styles.label}>{item.name}</span>
                </div>
                <span className={styles.value} style={{ color: item.color }}>
                  {percentFormatter.format(item.share)}%
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${item.share}%`, background: item.color }}
                />
              </div>
            </div>
          ))}

          {!loading && chartData.length > 0 && (
            <div className={styles.legendRow}>
              <div className={styles.rowTop}>
                <span className={styles.label}>Total apariții</span>
                <span className={styles.value}>
                  {countFormatter.format(totalCount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
