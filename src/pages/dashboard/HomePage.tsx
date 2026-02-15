import React from "react";
import ScoreEvolutionChart from "../../components/charts/ScoreEvolutionChart";
import SkillDistributionChart from "../../components/charts/SkillDistributionChart";
import styles from "./HomePage.module.css";

import { FaFileAlt, FaUsers, FaBullseye, FaBell } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const DocumentIcon = FaFileAlt as unknown as ComponentType<IconBaseProps>;
const UsersIcon = FaUsers as unknown as ComponentType<IconBaseProps>;
const TargetIcon = FaBullseye as unknown as ComponentType<IconBaseProps>;
const BellIcon = FaBell as unknown as ComponentType<IconBaseProps>;

const HomePage: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Panou principal</h2>
          <p className={styles.subtitle}>
            Vizualizare centralizată a proceselor de recrutare și a datelor
            asociate.
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            Sistem activ
          </div>
        </div>
      </header>

      <section className={styles.grid}>
        {/* METRIC 1 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <DocumentIcon size={18} />
              </div>
              <p className={styles.metricLabel}>CV-uri procesate</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>+12%</span>
          </div>

          <h3 className={styles.metricValue}>12,847</h3>
          <p className={styles.miniHint}>Ultimele 30 de zile</p>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: "70%" }} />
          </div>
        </div>

        {/* METRIC 2 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <UsersIcon size={18} />
              </div>
              <p className={styles.metricLabel}>Candidați activi</p>
            </div>
            <span className={styles.badge}>OK</span>
          </div>

          <h3 className={styles.metricValue}>3,429</h3>
          <p className={styles.miniHint}>În pipeline</p>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: "55%" }} />
          </div>
        </div>

        {/* METRIC 3 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <TargetIcon size={18} />
              </div>
              <p className={styles.metricLabel}>Rată compatibilitate</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>High</span>
          </div>

          <h3 className={styles.metricValue}>94.2%</h3>
          <p className={styles.miniHint}>Medie globală</p>
        </div>

        {/* METRIC 4 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <BellIcon size={18} />
              </div>
              <p className={styles.metricLabel}>Notificări</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>5</span>
          </div>

          <h3 className={styles.metricValue}>5</h3>
          <p className={styles.miniHint}>Necesită atenție</p>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: "30%" }} />
          </div>
        </div>

        {/* CHART 1 */}
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.chartBody}>
            <ScoreEvolutionChart />
          </div>
        </div>

        {/* CHART 2 */}
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.chartBody}>
            <SkillDistributionChart />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
