import React, { useEffect, useMemo, useState } from "react";
import ScoreEvolutionChart from "../../components/charts/ScoreEvolutionChart";
import SkillDistributionChart from "../../components/charts/SkillDistributionChart";
import styles from "./HomePage.module.css";

import { FaFileAlt, FaUsers, FaBullseye, FaBell } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

import {
  dashboardApi,
  type HomeDashboardDto,
} from "../../api/dashboard.service";

const DocumentIcon = FaFileAlt as unknown as ComponentType<IconBaseProps>;
const UsersIcon = FaUsers as unknown as ComponentType<IconBaseProps>;
const TargetIcon = FaBullseye as unknown as ComponentType<IconBaseProps>;
const BellIcon = FaBell as unknown as ComponentType<IconBaseProps>;

const formatDelta = (v: number) => {
  const n = Number.isFinite(v) ? v : 0;
  const rounded = Math.round(n * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
};

const formatPct = (rate: number) => {
  const r = Number.isFinite(rate) ? rate : 0;
  return `${Math.round(r * 100)}%`;
};

const toBadgeLabelForMatch = (avgMatch: number) => {
  if (avgMatch >= 80) return "High";
  if (avgMatch >= 55) return "Medium";
  return "Low";
};

const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getHome();
        if (mounted) setData(res);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = data?.kpis;

  const cvsUploadedLast30 = kpis?.cvsUploadedLast30 ?? 0;
  const cvsUploadedDeltaPct = kpis?.cvsUploadedDeltaPct ?? 0;

  const cvsAnalyzedLast30 = kpis?.cvsAnalyzedLast30 ?? 0;
  const analyzedRateLast30 = kpis?.analyzedRateLast30 ?? 0;

  const avgMatchLast30 = kpis?.avgMatchLast30 ?? 0;
  const matchBadge = useMemo(
    () => toBadgeLabelForMatch(avgMatchLast30),
    [avgMatchLast30],
  );

  const invitedLast30 = kpis?.invitedLast30 ?? 0;
  const invitedRateLast30 = kpis?.invitedRateLast30 ?? 0;

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
                <DocumentIcon size={16} />
              </div>
              <p className={styles.metricLabel}>CV-uri încărcate</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>
              {loading ? "..." : formatDelta(cvsUploadedDeltaPct)}
            </span>
          </div>

          <h3 className={styles.metricValue}>
            {loading ? "..." : cvsUploadedLast30.toLocaleString()}
          </h3>
          <p className={styles.miniHint}>Ultimele 30 de zile</p>
        </div>

        {/* METRIC 2 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <UsersIcon size={16} />
              </div>
              <p className={styles.metricLabel}>CV-uri analizate</p>
            </div>
            <span className={styles.badge}>
              {loading ? "..." : formatPct(analyzedRateLast30)}
            </span>
          </div>

          <h3 className={styles.metricValue}>
            {loading ? "..." : cvsAnalyzedLast30.toLocaleString()}
          </h3>
          <p className={styles.miniHint}>Ultimele 30 de zile</p>
        </div>

        {/* METRIC 3 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <TargetIcon size={16} />
              </div>
              <p className={styles.metricLabel}>Rată compatibilitate</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>
              {loading ? "..." : matchBadge}
            </span>
          </div>

          <h3 className={styles.metricValue}>
            {loading ? "..." : `${avgMatchLast30.toFixed(1)}%`}
          </h3>
          <p className={styles.miniHint}>Match mediu (ultimele 30 de zile)</p>
        </div>

        {/* METRIC 4 */}
        <div className={`${styles.card} ${styles.metric}`}>
          <div className={styles.metricHeader}>
            <div className={styles.metricLeft}>
              <div className={styles.iconBox}>
                <BellIcon size={16} />
              </div>
              <p className={styles.metricLabel}>INVITA</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>
              {loading ? "..." : formatPct(invitedRateLast30)}
            </span>
          </div>

          <h3 className={styles.metricValue}>
            {loading ? "..." : invitedLast30.toLocaleString()}
          </h3>
          <p className={styles.miniHint}>
            Recomandați pentru interviu (30 zile)
          </p>
        </div>

        {/* CHART 1 */}
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.chartBody}>
            <ScoreEvolutionChart
              data={data?.charts?.scoreEvolution ?? []}
              loading={loading}
            />
          </div>
        </div>

        {/* CHART 2 */}
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.chartBody}>
            <SkillDistributionChart
              data={data?.charts?.topSkillsLast30 ?? []}
              loading={loading}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
