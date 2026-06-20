import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../routs/paths";
import styles from "./Sidebar.module.css";
import { usersApi } from "../../api/users.service";
import Logo from "../../assets/logo.svg";

import {
  FaHome,
  FaPlusCircle,
  FaCloudUploadAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaRobot,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const HomeIcon = FaHome as unknown as ComponentType<IconBaseProps>;
const CreateJobIcon = FaPlusCircle as unknown as ComponentType<IconBaseProps>;
const UploadIcon = FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const CopilotIcon = FaRobot as unknown as ComponentType<IconBaseProps>;
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
  avatarUrl?: string | null;
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const getAvatarSrc = (avatarUrl?: string | null) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${API_BASE_URL}${avatarUrl}`;
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await usersApi.me();
        if (!cancelled) {
          setUser({
            firstName: me.firstName || "",
            lastName: me.lastName || "",
            avatarUrl: me.avatarUrl || "",
          });
        }
      } catch {
        localStorage.removeItem("access_token");
        navigate(PATHS.ROOT, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.dispatchEvent(new Event("auth-change"));
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
    {
      name: "Copilot",
      IconComponent: CopilotIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.COPILOT}`,
    },
    {
      name: "Calendar",
      IconComponent: CalendarIcon,
      path: `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.CALENDAR}`,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Se încarcă...";

  const initial = user
    ? `${user.lastName?.charAt(0) || ""}${user.firstName?.charAt(0) || ""}`.toUpperCase() ||
      "U"
    : "U";

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={toggle}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`}
        onClick={close}
      />

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <img src={Logo} alt="CV Analyzer" className={styles.brandLogo} />
            </div>
            <div className={styles.brandCopy}>
              <span className={styles.brandKicker}>AI CV review</span>
              <span className={styles.brandName}>CV Analyzer</span>
            </div>
          </div>

          <div className={styles.profileSection}>
            <div className={styles.profileAvatar}>
              {user?.avatarUrl ? (
                <img
                  src={getAvatarSrc(user.avatarUrl)}
                  alt="Avatar"
                  className={styles.avatarImg}
                />
              ) : (
                <span className={styles.avatarInitial}>{initial}</span>
              )}
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
                    onClick={close}
                  >
                    <item.IconComponent className={styles.navIcon} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav className={styles.navBottom}>
          <ul>
            <li>
              <Link
                to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.SETTINGS}`}
                className={`${styles.navLink} ${
                  isActive(
                    `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.SETTINGS}`,
                  )
                    ? styles.active
                    : ""
                }`}
                onClick={close}
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
    </>
  );
};

export default Sidebar;
