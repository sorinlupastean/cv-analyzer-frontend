import React, { useState, useEffect, useRef } from "react";
import styles from "./ResultsPage.module.css";
import { useNavigate, useLocation } from "react-router-dom";

// --- IMPORT REACT ICONS ---
import {
  FaBriefcase,
  FaUserCircle,
  FaCalendarAlt,
  FaSortAmountDown,
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const UserCircle = FaUserCircle as unknown as ComponentType<IconBaseProps>;
const CalendarAlt = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const SortAmountDown =
  FaSortAmountDown as unknown as ComponentType<IconBaseProps>;
const Eye = FaEye as unknown as ComponentType<IconBaseProps>;
const EyeSlash = FaEyeSlash as unknown as ComponentType<IconBaseProps>;
const ChevronLeft = FaChevronLeft as unknown as ComponentType<IconBaseProps>;
const CheckCircle = FaCheckCircle as unknown as ComponentType<IconBaseProps>;
const Lightbulb = FaLightbulb as unknown as ComponentType<IconBaseProps>;

interface CVResult {
  id: number;
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
}

interface JobResult {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  createdAt: string;
  cvs: CVResult[];
}

const ResultsPage: React.FC = () => {
  const [jobData, setJobData] = useState<JobResult[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openSortMenu, setOpenSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Simulăm datele (în mod normal vin din localStorage sau API)
    setJobData([
      {
        id: 1,
        title: "Frontend Developer",
        category: "IT & Software",
        location: "Remote",
        type: "Full-Time",
        createdAt: "29.11.2025",
        cvs: [
          {
            id: 101,
            fileName: "CV_Ion_Popescu.pdf",
            candidateName: "Ion Popescu",
            uploadDate: "15.01.2025",
            matchScore: 92,
            status: "Analizat",
            skills: ["React", "JavaScript", "CSS"],
          },
          {
            id: 102,
            fileName: "CV_Andreea_Stan.pdf",
            candidateName: "Andreea Stan",
            uploadDate: "15.01.2025",
            matchScore: 88,
            status: "Analizat",
            skills: ["HTML", "TypeScript", "Tailwind"],
          },
        ],
      },
      {
        id: 2,
        title: "Backend Developer",
        category: "IT & Software",
        location: "Remote",
        type: "Full-Time",
        createdAt: "28.11.2025",
        cvs: [
          {
            id: 201,
            fileName: "CV_Maria_Ionescu.pdf",
            candidateName: "Maria Ionescu",
            uploadDate: "14.01.2025",
            matchScore: 85,
            status: "Analizat",
            skills: ["Node.js", "MongoDB", "Express"],
          },
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setOpenSortMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortCVs = (items: CVResult[]) => {
    return [...items].sort((a, b) =>
      sortOrder === "asc"
        ? a.matchScore - b.matchScore
        : b.matchScore - a.matchScore,
    );
  };

  return (
    <div className={styles.resultsPage}>
      {/* HEADER DINAMIC */}
      <header className={styles.topBar}>
        {!selectedJob ? (
          <div className={styles.resultsTitleBlock}>
            <h2 className={styles.heroTitle}>Analiză Rezultate</h2>
            <p className={styles.heroSubtitle}>
              Sincronizare completă cu baza de date a candidaților.
            </p>
          </div>
        ) : (
          <div className={styles.selectedJobHeader}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedJob(null)}
            >
              <ChevronLeft /> Înapoi
            </button>
            <div className={styles.jobInfoMini}>
              <Briefcase className={styles.miniIcon} />
              <h3>{selectedJob.title}</h3>
              <span className={styles.badgeCount}>
                {selectedJob.cvs.length} CV-uri
              </span>
            </div>
          </div>
        )}

        {selectedJob && (
          <div className={styles.sortWrapper} ref={sortRef}>
            <button
              className={styles.sortBtn}
              onClick={() => setOpenSortMenu(!openSortMenu)}
            >
              <SortAmountDown />
              <span>
                {sortOrder === "desc" ? "Scor Descrescător" : "Scor Crescător"}
              </span>
            </button>
            {openSortMenu && (
              <div className={styles.dropdown}>
                <p
                  onClick={() => {
                    setSortOrder("desc");
                    setOpenSortMenu(false);
                  }}
                >
                  Cele mai mari scoruri
                </p>
                <p
                  onClick={() => {
                    setSortOrder("asc");
                    setOpenSortMenu(false);
                  }}
                >
                  Cele mai mici scoruri
                </p>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ZONA DE CONȚINUT CU SCROLL */}
      <main className={styles.contentScroll}>
        {!selectedJob ? (
          <div className={styles.jobList}>
            {jobData.map((job) => (
              <div
                key={job.id}
                className={styles.jobCard}
                onClick={() => setSelectedJob(job)}
              >
                <div className={styles.jobLeft}>
                  <div className={styles.iconBox}>
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.category} • {job.location}
                    </p>
                    <div className={styles.tagRow}>
                      <span className={styles.typeBadge}>{job.type}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.jobRight}>
                  <span className={styles.dateText}>{job.createdAt}</span>
                  <div className={styles.cvCounter}>
                    {job.cvs.length} Analize
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.cvGrid}>
            {sortCVs(selectedJob.cvs).map((cv) => (
              <div key={cv.id} className={styles.cvCard}>
                <div className={styles.cvTop}>
                  <div className={styles.candidateInfo}>
                    <UserCircle className={styles.userIcon} />
                    <div>
                      <h4>{cv.candidateName}</h4>
                      <p>{cv.fileName}</p>
                    </div>
                  </div>
                  <div className={styles.statusBadge}>
                    <CheckCircle /> {cv.status}
                  </div>
                </div>

                <div className={styles.scoreSection}>
                  <div className={styles.scoreHeader}>
                    <Lightbulb />
                    <span>
                      Scor Compatibilitate: <strong>{cv.matchScore}%</strong>
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${cv.matchScore}%` }}
                    />
                  </div>
                </div>

                <div className={styles.skillsRow}>
                  {cv.skills.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  className={styles.viewBtn}
                  onMouseEnter={() => setHovered(cv.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(`/cv/${cv.id}`)}
                >
                  {hovered === cv.id ? <Eye /> : <EyeSlash />}
                  Vizualizează Profil
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;
