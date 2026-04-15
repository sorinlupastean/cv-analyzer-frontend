import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "./SkillDistributionChart.module.css";

export type SkillPoint = {
  name: string;
  value: number;
};

type SkillDatum = {
  name: string;
  value: number;
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

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    obs.observe(ref.current);
    setWidth(ref.current.clientWidth);
    return () => obs.disconnect();
  }, [ref]);
  return width;
}

export default function SkillDistributionChart({ data, loading }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
    const cleaned = safe
      .map((x) => ({
        name: String(x?.name ?? "").trim(),
        value: Number(x?.value ?? 0),
      }))
      .filter(
        (x) => x.name.length > 0 && Number.isFinite(x.value) && x.value > 0,
      );
    if (cleaned.length === 0) return [];
    const sorted = [...cleaned].sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return a.name.localeCompare(b.name);
    });
    const top = sorted.slice(0, 5);
    const total = top.reduce((s, x) => s + x.value, 0);
    if (total <= 0) return [];
    return top.map((x, idx) => ({
      name: x.name,
      value: Math.round((x.value / total) * 1000) / 10,
      color: COLORS[idx % COLORS.length],
    }));
  }, [data]);

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex] ?? null;
  }, [activeIndex, chartData]);

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
        <div className={styles.chartSide}>
          <div className={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={4}
                  cornerRadius={7}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke="none"
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
                  {activeData.value.toFixed(1)}%
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
              onMouseLeave={() => setActiveIndex(null)}
              role="button"
              tabIndex={0}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveIndex(index);
                if (e.key === "Escape") setActiveIndex(null);
              }}
              aria-label={`${item.name}: ${item.value.toFixed(1)}%`}
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
                  {item.value.toFixed(1)}%
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
            </div>
          ))}

          {!loading && chartData.length === 0 && (
            <div className={styles.legendRow}>
              Nu există date încă (analizează câteva CV-uri ca să apară top
              skills).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
