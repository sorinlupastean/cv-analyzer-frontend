// src/pagini/dashboard/HomePage.tsx

import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import styles from "./HomePage.module.css";

const HomePage: React.FC = () => {
  return (
    <DashboardLayout pageTitle="Acasă">
      <div className={styles.homePage}>
        {/* Bannerul Albastru de Bun Venit */}
        <div className={styles.welcomeBanner}>
          Bun venit la CV Filter, asistentul tău inteligent în recrutare!
        </div>

        {/* Grid principal */}
        <section className={styles.gridContainer}>
          {/* Carduri mici */}
          <div className={styles.gridCard}>
            <p className={styles.placeholderText}>Număr Joburi Active</p>
          </div>

          <div className={styles.gridCard}>
            <p className={styles.placeholderText}>Număr CV-uri Procesate</p>
          </div>

          <div className={styles.gridCard}>
            <p className={styles.placeholderText}>Match Score Mediu</p>
          </div>

          <div className={styles.gridCard}>
            <p className={styles.placeholderText}>Total Notificări</p>
          </div>

          {/* Chart mare */}
          <div className={`${styles.gridCard} ${styles.chart1}`}>
            <p className={styles.placeholderText}>Diagramă, Evoluție Scoruri</p>
          </div>

          {/* Chart dreapta */}
          <div className={`${styles.gridCard} ${styles.chart2}`}>
            <p className={styles.placeholderText}>
              Diagramă, Distribuție Competențe
            </p>
          </div>

          {/* Carduri jos */}
          <div className={`${styles.gridCard} ${styles.numberData5}`}>
            <p className={styles.placeholderText}>Date, Cel mai bun CV</p>
          </div>

          <div className={`${styles.gridCard} ${styles.numberData6}`}>
            <p className={styles.placeholderText}>
              Date, Cel mai solicitat Job
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
