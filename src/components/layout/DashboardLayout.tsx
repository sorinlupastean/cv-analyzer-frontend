// src/components/layout/DashboardLayout.tsx

import React from "react";
import Sidebar from "./Sidebar"; // Importă Sidebar-ul de la tine
import "./Dashboard.css"; // Importă stilurile

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string; // Adaugă un titlu pentru a fi afișat în header-ul paginii
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
}) => {
  // Antetul Paginii Curente (ex: "Acasă")

  return (
    <div className="dashboard-app-container-new">
      {/* 1. Sidebar-ul (Stânga) */}
      <Sidebar />

      {/* 2. Zona de Conținut (Dreapta) */}
      <div className="main-content-area-new">
        {/* Conținutul paginii curente */}
        <main className="page-content-wrapper-new">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
