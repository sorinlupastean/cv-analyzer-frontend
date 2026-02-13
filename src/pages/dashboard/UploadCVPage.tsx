import React, { useEffect, useMemo, useState } from "react";
import styles from "./UploadCVPage.module.css";
import Notification from "../../components/Notification/Notification";
import toast, { Toaster } from "react-hot-toast";
import { jobsApi } from "../../api/jobs.service";
import { cvsApi, type Cv } from "../../api/cvs.service";

import {
  FaCloudUploadAlt,
  FaRegFilePdf,
  FaTrashAlt,
  FaRobot,
  FaBriefcase,
  FaSearch,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const CloudUploadAlt =
  FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const RegFilePdf = FaRegFilePdf as unknown as ComponentType<IconBaseProps>;
const TrashAlt = FaTrashAlt as unknown as ComponentType<IconBaseProps>;
const Robot = FaRobot as unknown as ComponentType<IconBaseProps>;
const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const SearchIcon = FaSearch as unknown as ComponentType<IconBaseProps>;

type JobLite = {
  id: number;
  title: string;
  location?: string;
  type?: string;
  createdAt?: string;
};

const UploadCVPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [cvs, setCvs] = useState<Cv[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // 1) Load jobs once
  useEffect(() => {
    (async () => {
      try {
        const data = await jobsApi.list(); // recomandat să fie tipat Promise<Job[]>
        setJobs(data as any);
        setSelectedJobId((data as any).length ? (data as any)[0].id : null);
      } catch {
        toast.error("Nu pot încărca job-urile din backend");
      }
    })();
  }, []);

  // 2) Load CVs whenever selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) {
      setCvs([]);
      return;
    }

    (async () => {
      try {
        const data = await cvsApi.listForJob(selectedJobId);
        setCvs(data);
      } catch {
        toast.error("Nu pot încărca CV-urile pentru job");
      }
    })();
  }, [selectedJobId]);

  const filteredJobs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => j.title.toLowerCase().includes(q));
  }, [jobs, searchTerm]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!selectedJobId) {
      setNotification({
        type: "error",
        title: "SISTEM BLOCAT",
        message: "Selectează un job înainte să încarci CV-uri.",
      });
      return;
    }

    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);

    try {
      await Promise.all(
        fileArr.map((f) => cvsApi.uploadForJob(selectedJobId, f)),
      );

      // refresh list
      const refreshed = await cvsApi.listForJob(selectedJobId);
      setCvs(refreshed);

      setNotification({
        type: "success",
        title: "DOCUMENTE ÎNCĂRCATE",
        message: `${fileArr.length} fișier(e) au fost încărcate în backend.`,
      });
    } catch {
      toast.error("Upload eșuat");
    } finally {
      e.target.value = "";
    }
  };

  const handleDelete = async (cvId: number) => {
    try {
      await cvsApi.remove(cvId);

      if (selectedJobId) {
        const refreshed = await cvsApi.listForJob(selectedJobId);
        setCvs(refreshed);
      }

      setNotification({
        type: "success",
        title: "UNITATE ELIMINATĂ",
        message: "Fișierul a fost șters din backend.",
      });
    } catch {
      toast.error("Nu pot șterge fișierul");
    }
  };

  const runMockAnalysis = () => {
    setNotification({
      type: "success",
      title: "ANALIZĂ IA ACTIVATĂ",
      message: "Scanăm abilitățile candidaților...",
    });

    window.setTimeout(() => {
      setNotification({
        type: "success",
        title: "SINAPSĂ COMPLETĂ",
        message: "Datele au fost agregate (mock).",
      });
    }, 1600);
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d; // fallback dacă vine deja formatat
    return dt.toLocaleDateString("ro-RO");
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes && bytes !== 0) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const runAnalysis = async () => {
    if (!selectedJobId || cvs.length === 0) return;

    try {
      // exemplu: analizează toate CV-urile din job
      await Promise.all(cvs.map((cv) => cvsApi.analyze(cv.id)));

      const refreshed = await cvsApi.listForJob(selectedJobId);
      setCvs(refreshed);

      setNotification({
        type: "success",
        title: "ANALIZĂ COMPLETĂ",
        message: "Analiza a fost salvată în backend.",
      });
    } catch {
      toast.error("Analiza a eșuat");
    }
  };

  return (
    <div className={styles.pageShell}>
      <Toaster position="bottom-right" />

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.container}>
        {/* LEFT PANEL: Jobs */}
        <aside className={styles.jobsPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.brandBlock}>
              <h2 className={styles.heroTitle}>
                Recruit<span>AI</span>
              </h2>
              <p className={styles.heroSubtitle}>
                Upload CV-uri și pornește matching
              </p>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <input
              placeholder="Caută în joburi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.jobScrollList}>
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                type="button"
                className={`${styles.jobMiniCard} ${
                  selectedJobId === job.id ? styles.activeJob : ""
                }`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <div className={styles.miniCardLeft}>
                  <div className={styles.miniIconBox}>
                    <Briefcase />
                  </div>
                  <div className={styles.jobText}>
                    <h4>{job.title}</h4>
                    <p>{job.location || "—"}</p>
                  </div>
                </div>

                <div className={styles.rightMeta}>
                  <span className={styles.countPill}>
                    {selectedJobId === job.id ? cvs.length : "—"} CV
                  </span>
                </div>
              </button>
            ))}

            {jobs.length === 0 && (
              <div className={styles.emptyPanel}>
                <p>Niciun job disponibil.</p>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.mainArea}>
          {selectedJob ? (
            <>
              <header className={styles.contentHeader}>
                <div className={styles.jobMainInfo}>
                  <h1>{selectedJob.title}</h1>
                  <div className={styles.metaRow}>
                    {selectedJob.type && (
                      <span className={styles.typeTag}>{selectedJob.type}</span>
                    )}
                    {selectedJob.createdAt && (
                      <span className={styles.dateTag}>
                        {formatDate(selectedJob.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.statsCircle}>
                  <strong>{cvs.length}</strong>
                  <span>CV-uri</span>
                </div>
              </header>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.sectionTitle}>
                    <CloudUploadAlt />
                    <h3>Încărcare CV-uri</h3>
                  </div>

                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={runAnalysis}
                    disabled={cvs.length === 0}
                  >
                    <Robot />
                    Inițiază analiza
                  </button>
                </div>

                <label className={styles.uploadZone}>
                  <div className={styles.uploadIconPulse}>
                    <CloudUploadAlt />
                  </div>
                  <div className={styles.uploadText}>
                    <span>Drop CV-uri aici sau click pentru upload</span>
                    <small>PDF, DOCX (max 10MB per fișier)</small>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpload}
                  />
                </label>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.sectionTitle}>
                    <RegFilePdf />
                    <h3>Baza de date curentă</h3>
                  </div>
                </div>

                <div className={styles.tableWrap}>
                  {cvs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <RegFilePdf className={styles.emptyIcon} />
                      <h4>Niciun fișier asociat</h4>
                      <p>
                        Încarcă CV-uri pentru acest job ca să începi
                        matching-ul.
                      </p>
                    </div>
                  ) : (
                    <table className={styles.crystalTable}>
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>Mărime</th>
                          <th>Data</th>
                          <th>Acțiune</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cvs.map((cv) => (
                          <tr key={cv.id}>
                            <td className={styles.fileNameCell}>
                              <RegFilePdf className={styles.pdfIcon} />
                              {cv.fileName}
                            </td>
                            <td>{formatSize(cv.fileSize ?? null)}</td>
                            <td>{formatDate(cv.uploadDate ?? cv.createdAt)}</td>
                            <td>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(cv.id)}
                                aria-label="Șterge"
                                title="Șterge"
                              >
                                <TrashAlt />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className={styles.noJobSelected}>
              <Briefcase size={30} />
              <h4>Selectează un job pentru a încărca CV-uri</h4>
              <p>Panelul din stânga îți arată joburile disponibile.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UploadCVPage;
