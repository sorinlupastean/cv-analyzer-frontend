import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "./SkillDistributionChart.module.css";

type SkillDatum = {
  name: string;
  value: number;
  color: string;
};

const data: SkillDatum[] = [
  { name: "Technical Skills", value: 35, color: "#0ea5e9" },
  { name: "Communication", value: 25, color: "#60a5fa" },
  { name: "Leadership", value: 18, color: "#22d3ee" },
  { name: "Problem Solving", value: 15, color: "#6366f1" },
  { name: "Creativity", value: 7, color: "#2dd4bf" },
];

export default function SkillDistributionChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return data[activeIndex] ?? null;
  }, [activeIndex]);

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Distribuția abilităților</h3>
          <p className={styles.subtitle}>Top competențe identificate</p>
        </div>

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Live
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* CHART SIDE */}
        <div className={styles.chartSide}>
          <div className={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  cornerRadius={7}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke="none"
                >
                  {data.map((entry, index) => (
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

            {/* CENTER BUBBLE */}
            {activeData && (
              <div className={styles.centerBubble} aria-live="polite">
                <span className={styles.centerLabel}>{activeData.name}</span>
                <span
                  className={styles.centerValue}
                  style={{ color: activeData.color }}
                >
                  {activeData.value}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LEGEND SIDE */}
        <div className={styles.legendSide}>
          {data.map((item, index) => (
            <div
              key={item.name}
              className={`${styles.legendRow} ${
                index === activeIndex ? styles.active : ""
              }`}
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
              aria-label={`${item.name}: ${item.value}%`}
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
                  {item.value}%
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
        </div>
      </div>
    </div>
  );
}
