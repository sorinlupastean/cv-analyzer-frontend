import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../routs/paths";
import styles from "./Dashboard.module.css";

// --- ICONS ---
import {
  FaHome,
  FaPlusCircle,
  FaCloudUploadAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

// --- FIX TYPESCRIPT ICONS ---
const HomeIcon = FaHome as unknown as ComponentType<IconBaseProps>;
const CreateJobIcon = FaPlusCircle as unknown as ComponentType<IconBaseProps>;
const UploadIcon = FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const ResultsIcon = FaChartBar as unknown as ComponentType<IconBaseProps>;
const SettingsIcon = FaCog as unknown as ComponentType<IconBaseProps>;
const LogoutIcon = FaSignOutAlt as unknown as ComponentType<IconBaseProps>;
const ProfileIcon = FaUserCircle as unknown as ComponentType<IconBaseProps>;

interface NavItem {
  name: string;
  IconComponent: React.ElementType;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate(PATHS.ROOT, { replace: true });
  };

  // --- MAIN NAV ---
  const mainNav: NavItem[] = [
    {
      name: "Acasă",
      IconComponent: HomeIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`,
    },
    {
      name: "Creează Job",
      IconComponent: CreateJobIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.CREATE_JOB}`,
    },
    {
      name: "Încarcă CV-uri",
      IconComponent: UploadIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.UPLOAD_CV}`,
    },
    {
      name: "Rezultate Analiză",
      IconComponent: ResultsIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.RESULTS}`,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={styles.sidebarContainerNew}>
      {/* --- PROFILE --- */}
      <div className={styles.profileSection}>
        <div className={styles.profileIcon}>
          <ProfileIcon />
        </div>
        <span className={styles.profileName}>Utilizator Autentificat</span>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <nav className={styles.sidebarNavMain}>
        <ul>
          {mainNav.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  isActive(item.path) ? styles.active : ""
                }`}
              >
                <span className={styles.navIcon}>
                  <item.IconComponent />
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- BOTTOM NAV --- */}
      <nav className={styles.sidebarNavBottom}>
        <ul>
          <li>
            <Link
              to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.SETTINGS}`}
              className={`${styles.navLink} ${
                isActive(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.SETTINGS}`)
                  ? styles.active
                  : ""
              }`}
            >
              <span className={styles.navIcon}>
                <SettingsIcon />
              </span>
              Setări
            </Link>
          </li>

          <li>
            <button
              type="button"
              className={`${styles.navLink} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              <span className={styles.navIcon}>
                <LogoutIcon />
              </span>
              Delogare
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
