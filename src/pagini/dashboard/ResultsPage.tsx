import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./ResultsPage.css";

import UserIcon from "../../assets/user-animated.svg";
import CalendarIcon from "../../assets/calendar-animated.svg";
import EyeOpen from "../../assets/eye-open.svg";
import EyeClosed from "../../assets/eye-closed.svg";
import SortIcon from "../../assets/sort.svg";

interface CVResult {
  id: number;
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
}

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<CVResult[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [openSortMenu, setOpenSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cvAnalysisResults");
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      setResults([
        {
          id: 1,
          fileName: "CV_Ion_Popescu.pdf",
          candidateName: "Ion Popescu",
          uploadDate: "15.01.2025",
          matchScore: 92,
          status: "Analizat",
          skills: ["Python", "Django", "REST"],
        },
        {
          id: 2,
          fileName: "CV_Maria_Ionescu.pdf",
          candidateName: "Maria Ionescu",
          uploadDate: "14.01.2025",
          matchScore: 85,
          status: "Analizat",
          skills: ["React", "Node.js", "AWS"],
        },
      ]);
    }
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setOpenSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sortedResults = [...results].sort((a, b) =>
    sortOrder === "asc"
      ? a.matchScore - b.matchScore
      : b.matchScore - a.matchScore
  );

  return (
    <DashboardLayout pageTitle="Rezultate Analiză">
      <div className="results-page">
        <div className="results-top-row">
          {/* Titlu */}
          <div className="results-title-block">
            <p className="results-eyebrow">Panou rezultate</p>

            <h2 className="results-title-main">
              <span>Rezultate</span>{" "}
              <span className="results-title-accent">Analiză CV-uri</span>
            </h2>

            <p className="results-subtitle">
              Vezi scorurile de potrivire pentru candidații analizați pentru
              joburile tale active.
            </p>
          </div>

          {/* SORTARE — Identică cu Creează Job */}
          <div className="results-sort-block" ref={sortRef}>
            <button
              className="sort-toggle"
              onClick={() => setOpenSortMenu((prev) => !prev)}
            >
              <img src={SortIcon} alt="sort" className="sort-icon" />
              <span>Sortare după:</span>
              <span className="sort-value">
                <strong>
                  {sortOrder === "desc"
                    ? "Scor: cele mai mari"
                    : "Scor: cele mai mici"}
                </strong>
              </span>
            </button>

            {openSortMenu && (
              <div className="sort-dropdown">
                <p
                  className={sortOrder === "desc" ? "active" : ""}
                  onClick={() => {
                    setSortOrder("desc");
                    setOpenSortMenu(false);
                  }}
                >
                  Scor: cele mai mari
                </p>

                <p
                  className={sortOrder === "asc" ? "active" : ""}
                  onClick={() => {
                    setSortOrder("asc");
                    setOpenSortMenu(false);
                  }}
                >
                  Scor: cele mai mici
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GRID CARDURI */}
        <div className="results-grid">
          {sortedResults.map((cv) => (
            <div key={cv.id} className="result-card">
              <div className="card-top">
                <h3 className="file-name">{cv.fileName}</h3>
                <span className="status-badge">{cv.status}</span>
              </div>

              <div className="info-line">
                <img src={UserIcon} className="info-icon" alt="user" />
                {cv.candidateName}
              </div>

              <div className="info-line">
                <img src={CalendarIcon} className="info-icon" alt="date" />
                {cv.uploadDate}
              </div>

              <div className="score-box">
                <span className="score-text">{cv.matchScore}% potrivire</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${cv.matchScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="skills-list">
                {cv.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <button
                className="view-btn"
                onMouseEnter={() => setHovered(cv.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <img
                  src={hovered === cv.id ? EyeOpen : EyeClosed}
                  className="eye-icon"
                  alt="eye"
                />
                Vizualizează
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
