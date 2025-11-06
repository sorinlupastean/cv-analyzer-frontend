// src/pages/dashboard/HomePage.tsx

import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "../../components/layout/Dashboard.css"; // Stilurile necesare

const HomePage: React.FC = () => {
  return (
    // Folosim layout-ul și îi dăm titlul "Acasă"
    <DashboardLayout pageTitle="Acasă">
      <div className="home-page-new">
        {/* Bannerul Albastru de Bun Venit (Sus) */}
        <div className="welcome-banner">
          Bun venit la CV Filter — asistentul tău inteligent în recrutare!
        </div>

        {/* Grid-ul Principal de Date și Diagrame */}
        <section className="grid-container-home">
          {/* Rândul 1: Carduri Mici (Number Data) */}
          <div className="grid-card">
            <p className="placeholder-text">Număr Joburi Active</p>
          </div>
          <div className="grid-card">
            <p className="placeholder-text">Număr CV-uri Procesate</p>
          </div>
          <div className="grid-card">
            <p className="placeholder-text">Match Score Mediu</p>
          </div>
          <div className="grid-card">
            <p className="placeholder-text">Total Notificări</p>
          </div>

          {/* Rândul 2 și 3: Diagrame și Date */}

          {/* Chart 1: Cel mai mare card (stânga) */}
          <div className="grid-card chart-1">
            <p className="placeholder-text">Diagramă - Evoluție Scoruri</p>
          </div>

          {/* Chart 2: Dreapta Sus */}
          <div className="grid-card chart-2">
            <p className="placeholder-text">
              Diagramă - Distribuție Competențe
            </p>
          </div>

          {/* Number Data 5: Dreapta Jos 1 */}
          <div className="grid-card number-data-5">
            <p className="placeholder-text">Date - Cel mai bun CV</p>
          </div>

          {/* Number Data 6: Dreapta Jos 2 */}
          <div className="grid-card number-data-6">
            <p className="placeholder-text">Date - Cel mai solicitat Job</p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
