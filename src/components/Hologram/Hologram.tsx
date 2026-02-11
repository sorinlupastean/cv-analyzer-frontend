import React from "react";
import styles from "./Hologram.module.css";

interface HologramProps {
  variant?: "primary" | "secondary";
  isVisible: boolean;
}

const Hologram: React.FC<HologramProps> = ({
  variant = "primary",
  isVisible,
}) => {
  // Clasa pentru containerul exterior care controlează culorile (primary/secondary)
  const containerClass = variant === "secondary" ? styles.secondary : "";

  // Clasa pentru vizibilitate
  const wrapperClass = `${styles.wrapper} ${isVisible ? styles.visible : ""}`;

  return (
    <div className={wrapperClass}>
      {/* Containerul care aplică variabilele de culoare */}
      <div className={`${styles.container} ${containerClass}`}>
        {/* 1. Nucleul Central */}
        <div className={styles.core}></div>

        {/* 2. Inelele Concentrice */}
        <div className={styles.ringInner}></div>
        <div className={styles.ringMiddle}></div>
        <div className={styles.ringOuter}></div>

        {/* 3. Efectul de Scanare */}
        <div className={styles.scanner}></div>
      </div>
    </div>
  );
};

export default Hologram;
