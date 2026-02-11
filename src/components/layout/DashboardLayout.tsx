// src/components/layout/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import styles from "./Dashboard.module.css"; // Importă ca modul

const DashboardLayout: React.FC = () => {
  return (
    <div className={styles.dashboardAppContainerNew}>
      {/* Sidebar Fix */}
      <Sidebar />

      {/* Zona de Conținut */}
      <div className={styles.mainContentAreaNew}>
        <main className={styles.pageContentWrapperNew}>
          {/* Aici vor fi randate paginile (Home, CreateJob, etc) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
