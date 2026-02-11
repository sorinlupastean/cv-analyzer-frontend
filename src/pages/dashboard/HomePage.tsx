import React from "react";
import ScoreEvolutionChart from "../../components/charts/ScoreEvolutionChart";
import SkillDistributionChart from "../../components/charts/SkillDistributionChart";

import styles from "./HomePage.module.css";

// --- 1. IMPORT REACT ICONS ---
import { FaFileAlt, FaUsers, FaBullseye, FaBell } from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

// --- 2. FIX TYPESCRIPT (Standardizat) ---
// Transformăm iconițele în componente compatibile perfect
const DocumentIcon = FaFileAlt as unknown as ComponentType<IconBaseProps>;
const UsersIcon = FaUsers as unknown as ComponentType<IconBaseProps>;
const TargetIcon = FaBullseye as unknown as ComponentType<IconBaseProps>;
const BellIcon = FaBell as unknown as ComponentType<IconBaseProps>;

const HomePage: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      {/* HERO SECTION */}
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Panou principal</h2>
        <p className={styles.heroSubtitle}>
          Vizualizare centralizată a proceselor de recrutare și a datelor
          asociate.
        </p>
      </div>

      {/* GRID SECTION */}
      <section className={styles.grid}>
        {/* CARD 1: CV-uri */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              {/* Folosim noua componentă din react-icons */}
              <DocumentIcon size={20} />
            </div>
            <span className={styles.cardLabel}>CV-uri Procesate</span>
          </div>
          <h3 className={styles.cardValue}>12,847</h3>
          <div className={styles.sparkline}>
            <div className={styles.sparkFill} style={{ width: "70%" }} />
          </div>
        </div>

        {/* CARD 2: Candidați */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <UsersIcon size={20} />
            </div>
            <span className={styles.cardLabel}>Candidați Activi</span>
          </div>
          <h3 className={styles.cardValue}>3,429</h3>
          <div className={styles.sparkline}>
            <div className={styles.sparkFill} style={{ width: "55%" }} />
          </div>
        </div>

        {/* CARD 3: Match Rate */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <TargetIcon size={20} />
            </div>
            <span className={styles.cardLabel}>Rată Compatibilitate</span>
          </div>
          <h3 className={styles.cardValue}>94.2%</h3>
          <div className={styles.sparkline}>
            <div className={styles.sparkFill} style={{ width: "94%" }} />
          </div>
        </div>

        {/* CARD 4: Notificări */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <BellIcon size={20} />
            </div>
            <span className={styles.cardLabel}>Notificări Sistem</span>
          </div>
          <h3 className={styles.cardValue}>5</h3>
          <div className={styles.sparkline}>
            <div className={styles.sparkFill} style={{ width: "30%" }} />
          </div>
        </div>

        {/* LARGE CHART 1 */}
        <div className={styles.cardLarge}>
          <div className={styles.cardHeader} style={{ marginBottom: "20px" }}>
            <span className={styles.cardLabel}>Evoluție Scor Performanță</span>
          </div>
          <div className={styles.chartContainer}>
            <ScoreEvolutionChart />
          </div>
        </div>

        {/* LARGE CHART 2 */}
        <div className={styles.cardLarge}>
          <div className={styles.cardHeader} style={{ marginBottom: "20px" }}>
            <span className={styles.cardLabel}>Distribuție Abilități</span>
          </div>
          <div className={styles.chartContainer}>
            <SkillDistributionChart />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
