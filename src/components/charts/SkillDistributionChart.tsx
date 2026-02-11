import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "./SkillDistributionChart.module.css";

type SkillDatum = {
  name: string;
  value: number;
  color: string;
};

// Culori actualizate pentru tema "Surface / Reef"
const data: SkillDatum[] = [
  { name: "Technical Skills", value: 35, color: "#06b6d4" }, // Cyan-500
  { name: "Communication", value: 25, color: "#3b82f6" }, // Blue-500
  { name: "Leadership", value: 18, color: "#0ea5e9" }, // Sky-500
  { name: "Problem Solving", value: 15, color: "#6366f1" }, // Indigo-500
  { name: "Creativity", value: 7, color: "#2dd4bf" }, // Teal-400
];

export default function SkillDistributionChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Dacă nu e nimic hover, afișăm primul element ca default (opțional)
  const activeData = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Distribuția Abilităților</h3>
          <p className={styles.subtitle}>Top competențe identificate</p>
        </div>
        <div className={styles.miniIcon} />
      </div>

      {/* CONȚINUT */}
      <div className={styles.content}>
        {/* CHART AREA */}
        <div className={styles.chartSide}>
          <div className={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  cornerRadius={6} // Colțuri rotunjite la segmente
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke="none" // Fără bordură implicită
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      // Efect de "selecție" prin opacitate
                      fillOpacity={
                        activeIndex === null || activeIndex === index ? 1 : 0.3
                      }
                      stroke={activeIndex === index ? "#fff" : "none"}
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* BUBBLE CENTRAL - Apare doar la hover */}
            {activeData && (
              <div className={styles.centerBubble}>
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

        {/* LEGENDĂ */}
        <div className={styles.legendSide}>
          {data.map((item, index) => (
            <div
              key={item.name}
              className={`${styles.legendRow} ${index === activeIndex ? styles.active : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
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

              {/* Progress Bar umplut */}
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
