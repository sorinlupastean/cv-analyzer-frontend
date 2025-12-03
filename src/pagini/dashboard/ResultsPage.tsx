import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import styles from "./ResultsPage.module.css";

import UserIcon from "../../assets/user-animated.svg";
import CalendarIcon from "../../assets/calendar-animated.svg";
import EyeOpen from "../../assets/eye-open.svg";
import EyeClosed from "../../assets/eye-closed.svg";
import SortIcon from "../../assets/sort.svg";
import Briefcase from "../../assets/briefcase.svg";
import PhoneIcon from "../../assets/phone.svg";
import SchoolIcon from "../../assets/school.svg";
import AwardIcon from "../../assets/award.svg";

import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

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

  // Load mock data
  useEffect(() => {
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

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setOpenSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state?.openJobId) {
      const job = jobData.find((j) => j.id === location.state.openJobId);
      if (job) setSelectedJob(job);
    }
  }, [jobData, location.state]);

  // Sort logic
  const sortCVs = (items: CVResult[]) => {
    return [...items].sort((a, b) =>
      sortOrder === "asc"
        ? a.matchScore - b.matchScore
        : b.matchScore - a.matchScore
    );
  };

  return (
    <DashboardLayout pageTitle="Rezultate Analiză">
      <div className={styles.resultsPage}>
        {/* HEADER PENTRU LISTA DE JOBURI */}
        {!selectedJob && (
          <div className={styles.resultsTopRow}>
            <div className={styles.resultsTitleBlock}>
              <p className={styles.resultsEyebrow}>Panou rezultate</p>

              <h2 className={styles.resultsTitleMain}>
                <span>Rezultate</span>{" "}
                <span className={styles.resultsTitleAccent}>
                  Analiză CV-uri
                </span>
              </h2>

              <p className={styles.resultsSubtitle}>
                Vezi scorurile de potrivire pentru candidații analizați pentru
                joburile tale.
              </p>
            </div>
          </div>
        )}

        {/* VEDERE JOB SELECTAT */}
        {selectedJob && (
          <div className={styles.selectedMode}>
            {/* CARD JOB SUS EXACT CA ÎN SCREENSHOT */}
            <div className={styles.selectedJobCard}>
              <div className={styles.jobLeft}>
                <div className={styles.jobIcon}>
                  <img src={Briefcase} alt="job" />
                </div>

                <div>
                  <h3 className={styles.jobTitle}>{selectedJob.title}</h3>

                  <p className={styles.jobMeta}>
                    {selectedJob.category} · {selectedJob.location}
                  </p>

                  <div className={styles.jobTags}>
                    <span className={styles.badgeType}>{selectedJob.type}</span>
                    <span className={styles.badgeCount}>
                      {selectedJob.cvs.length} CV-uri analizate
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.rightSideInfo}>
                {selectedJob.createdAt}
              </div>
            </div>

            {/* LINIA CU BACK + SORTARE */}
            <div className={styles.selectedControls}>
              <button
                className={styles.backButton}
                onClick={() => setSelectedJob(null)}
              >
                Înapoi la lista de joburi
              </button>

              <div className={styles.resultsSortBlock} ref={sortRef}>
                <button
                  className={styles.sortToggle}
                  onClick={() => setOpenSortMenu((p) => !p)}
                >
                  Sortare după:
                  <strong>
                    {sortOrder === "desc"
                      ? " Scor: cele mai mari"
                      : " Scor: cele mai mici"}
                  </strong>
                  <img
                    src={SortIcon}
                    className={`${styles.sortArrow} ${
                      openSortMenu ? styles.sortArrowUp : styles.sortArrowDown
                    }`}
                    alt=""
                  />
                </button>

                {openSortMenu && (
                  <div className={styles.sortDropdown}>
                    <p
                      className={sortOrder === "desc" ? styles.active : ""}
                      onClick={() => {
                        setSortOrder("desc");
                        setOpenSortMenu(false);
                      }}
                    >
                      Scor: cele mai mari
                    </p>

                    <p
                      className={sortOrder === "asc" ? styles.active : ""}
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

            {/* GRID CV-URI */}
            <div className={styles.cvGrid}>
              {sortCVs(selectedJob.cvs).map((cv) => (
                <div key={cv.id} className={styles.cvCard}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.fileName}>{cv.fileName}</h3>
                    <span className={styles.statusBadge}>{cv.status}</span>
                  </div>

                  <div className={styles.infoLine}>
                    <img src={UserIcon} alt="" />
                    {cv.candidateName}
                  </div>

                  <div className={styles.infoLine}>
                    <img src={CalendarIcon} alt="" />
                    {cv.uploadDate}
                  </div>

                  <div className={styles.scoreBox}>
                    <span className={styles.scoreText}>
                      {cv.matchScore}% potrivire
                    </span>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${cv.matchScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={styles.skillsList}>
                    {cv.skills.map((skill) => (
                      <span key={skill} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      navigate(`/cv/${cv.id}`, {
                        state: { fromResults: true, jobId: selectedJob?.id },
                      })
                    }
                    onMouseEnter={() => setHovered(cv.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <img
                      src={hovered === cv.id ? EyeOpen : EyeClosed}
                      alt=""
                      className={styles.eyeIcon}
                    />
                    Vizualizează
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTA JOBURI (vederea inițială) */}
        {!selectedJob && (
          <div className={styles.jobList}>
            {jobData.map((job) => (
              <div
                key={job.id}
                className={styles.jobCard}
                onClick={() => setSelectedJob(job)}
              >
                <div className={styles.jobLeft}>
                  <div className={styles.jobIcon}>
                    <img src={Briefcase} alt="job" />
                  </div>

                  <div>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <p className={styles.jobMeta}>
                      {job.category} • {job.location}
                    </p>

                    <div className={styles.jobTags}>
                      <span className={styles.badgeType}>{job.type}</span>
                      <span className={styles.badgeCount}>
                        {job.cvs.length} CV-uri analizate
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.jobRight}>
                  <span className={styles.jobDate}>{job.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
