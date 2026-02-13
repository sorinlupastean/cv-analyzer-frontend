import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../routs/paths";
import styles from "./Sidebar.module.css";
import { getCurrentUser } from "../../api/auth.service";

import {
  FaHome,
  FaPlusCircle,
  FaCloudUploadAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const HomeIcon = FaHome as unknown as ComponentType<IconBaseProps>;
const CreateJobIcon = FaPlusCircle as unknown as ComponentType<IconBaseProps>;
const UploadIcon = FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const ResultsIcon = FaChartBar as unknown as ComponentType<IconBaseProps>;
const SettingsIcon = FaCog as unknown as ComponentType<IconBaseProps>;
const LogoutIcon = FaSignOutAlt as unknown as ComponentType<IconBaseProps>;

interface NavItem {
  name: string;
  IconComponent: React.ElementType;
  path: string;
}

interface User {
  firstName: string;
  lastName: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch {
        localStorage.removeItem("access_token");
        navigate(PATHS.ROOT, { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate(PATHS.ROOT, { replace: true });
  };

  const mainNav: NavItem[] = [
    {
      name: "Acasă",
      IconComponent: HomeIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`,
    },
    {
      name: "Locuri de muncă",
      IconComponent: CreateJobIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.CREATE_JOB}`,
    },
    {
      name: "Încarcă CV",
      IconComponent: UploadIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.UPLOAD_CV}`,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Se încarcă...";

  const initial = user
    ? `${user.lastName?.charAt(0) || ""}${user.firstName?.charAt(0) || ""}`.toUpperCase()
    : "U";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profileSection}>
        <div className={styles.profileAvatar}>
          <span className={styles.avatarInitial}>{initial}</span>
        </div>
        <span className={styles.profileName}>{fullName}</span>
      </div>

      <nav className={styles.navMain}>
        <ul>
          {mainNav.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  isActive(item.path) ? styles.active : ""
                }`}
              >
                <item.IconComponent className={styles.navIcon} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className={styles.navBottom}>
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
              <SettingsIcon className={styles.navIcon} />
              <span>Setări</span>
            </Link>
          </li>

          <li>
            <button
              type="button"
              className={`${styles.navLink} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              <LogoutIcon className={styles.navIcon} />
              <span>Delogare</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
