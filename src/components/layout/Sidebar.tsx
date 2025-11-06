import React from "react";
import { Link, useLocation } from "react-router-dom"; // 🔹 Importă Link și useLocation
import "./Dashboard.css";

// ICONIȚE SVG
import { ReactComponent as HomeIcon } from "../../assets/home.svg";
import { ReactComponent as CreateJobIcon } from "../../assets/file-job.svg";
import { ReactComponent as UploadIcon } from "../../assets/upload-cv.svg";
import { ReactComponent as ResultsIcon } from "../../assets/chart.svg";
import { ReactComponent as SettingsIcon } from "../../assets/settings.svg";
import { ReactComponent as LogoutIcon } from "../../assets/logout.svg";
import { ReactComponent as ProfileIcon } from "../../assets/account.svg";

interface NavItem {
  name: string;
  IconComponent: React.ElementType;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation(); // 🔹 Obținem calea curentă pentru a marca linkul activ

  const mainNav: NavItem[] = [
    { name: "Acasă", IconComponent: HomeIcon, path: "/dashboard/home" },
    {
      name: "Creează Job",
      IconComponent: CreateJobIcon,
      path: "/dashboard/create-job",
    },
    {
      name: "Încarcă CV-uri",
      IconComponent: UploadIcon,
      path: "/dashboard/upload-cvs",
    },
    {
      name: "Rezultate Analiză",
      IconComponent: ResultsIcon,
      path: "/dashboard/results",
    },
  ];

  const bottomNav: NavItem[] = [
    {
      name: "Setări",
      IconComponent: SettingsIcon,
      path: "/dashboard/settings",
    },
    { name: "Deloghează-te", IconComponent: LogoutIcon, path: "/logout" },
  ];

  return (
    <aside className="sidebar-container-new">
      {/* Profil */}
      <div className="profile-section">
        <div className="profile-icon">
          <ProfileIcon />
        </div>
        <span className="profile-name">Sorin Lupaștean</span>
      </div>

      {/* Navigație principală */}
      <nav className="sidebar-nav-main">
        <ul>
          {mainNav.map((item) => (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">
                  <item.IconComponent />
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Navigație jos */}
      <nav className="sidebar-nav-bottom">
        <ul>
          {bottomNav.map((item) => (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">
                  <item.IconComponent />
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
