import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import styles from "./DashboardLayout.module.css";

const DashboardLayout: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <div className={styles.mainContentArea}>
        <main className={styles.pageContentWrapper}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
