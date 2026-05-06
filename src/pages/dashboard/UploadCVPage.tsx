import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./UploadCVPage.module.css";
import { jobsApi } from "../../api/jobs.service";
import { cvsApi, type Cv } from "../../api/cvs.service";
import { PATHS } from "../../routs/paths";

import {
  FaCloudUploadAlt,
  FaRegFilePdf,
  FaTrashAlt,
  FaRobot,
  FaBriefcase,
  FaSearch,
  FaCalendarAlt,
  FaEye,
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
const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const EyeIcon = FaEye as unknown as ComponentType<IconBaseProps>;

type JobLite = {
  id: number;
  title: string;
  location?: string;
  type?: string;
  createdAt?: string;
  status?: "ACTIVE" | "CLOSED" | string;
};

const UploadCVPage: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [cvs, setCvs] = useState<Cv[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [cvCounts, setCvCounts] = useState<Record<number, number>>({});
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const data = (await jobsApi.list()) as JobLite[] | null;
        const jobsList = data ?? [];

        setJobs(jobsList);
        setSelectedJobId(jobsList.length ? jobsList[0].id : null);

        const pairs = await Promise.all(
          jobsList.map(async (j) => {
            try {
              const list = await cvsApi.listForJob(j.id);
              return [j.id, list.length] as const;
            } catch {
              return [j.id, 0] as const;
            }
          }),
        );

        setCvCounts(Object.fromEntries(pairs));
      } catch {
        toast.error("Nu pot încărca job-urile din backend.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setCvs([]);
      return;
    }

    (async () => {
      try {
        await refreshCvs(selectedJobId);
      } catch {
        toast.error("Nu pot încărca CV-urile pentru job.");
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

  const isClosed = selectedJob?.status === "CLOSED";

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes && bytes !== 0) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const refreshCvs = async (jobId: number) => {
    const refreshed = await cvsApi.listForJob(jobId);
    setCvs(refreshed);

    setCvCounts((prev) => ({
      ...prev,
      [jobId]: refreshed.length,
    }));
  };

  const canUploadFiles = (showMessage = true) => {
    if (!selectedJobId) {
      if (showMessage) toast.error("Selectează un job înainte să încarci CV-uri.");
      return false;
    }

    if (isClosed) {
      if (showMessage) toast.error("Postul este închis.");
      return false;
    }

    return true;
  };

  const uploadFiles = async (files: File[]) => {
    if (!canUploadFiles()) return;
    if (files.length === 0) return;

    const acceptedFiles = files.filter((file) =>
      /\.(pdf|docx?)$/i.test(file.name),
    );

    if (acceptedFiles.length === 0) {
      toast.error("Te rog încarcă doar fișiere PDF sau DOCX.");
      return;
    }

    try {
      await Promise.all(
        acceptedFiles.map((file) => cvsApi.uploadForJob(selectedJobId!, file)),
      );
      await refreshCvs(selectedJobId!);

      toast.success(`${acceptedFiles.length} fișier(e) încărcate.`);
    } catch {
      toast.error("Upload eșuat.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      await uploadFiles(Array.from(files));
    } finally {
      e.target.value = "";
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canUploadFiles(false)) return;

    dragDepthRef.current += 1;
    setIsDraggingFiles(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canUploadFiles(false)) return;

    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFiles(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingFiles(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDraggingFiles(false);

    const files = Array.from(event.dataTransfer.files || []);
    await uploadFiles(files);
  };

  const handleDelete = async (cvId: number) => {
    try {
      await cvsApi.remove(cvId);

      if (selectedJobId) {
        await refreshCvs(selectedJobId);
      }

      toast.success("Fișierul a fost șters.");
    } catch {
      toast.error("Nu pot șterge fișierul.");
    }
  };

  const runAnalysis = async () => {
    if (!selectedJobId || cvs.length === 0) return;

    if (isClosed) {
      toast.error("Post închis, analiza este blocată.");
      return;
    }

    try {
      toast.loading("Rulez analiza pentru CV-uri...", { id: "bulkAnalyze" });

      for (let i = 0; i < cvs.length; i++) {
        const cv = cvs[i];
        toast.loading(`Analizez CV ${i + 1} din ${cvs.length}: ${cv.fileName}...`, {
          id: "bulkAnalyze",
        });
        await cvsApi.analyzeForJob(selectedJobId, cv.id);

        if (i < cvs.length - 1) {
          await new Promise((res) => setTimeout(res, 2000));
        }
      }

      await refreshCvs(selectedJobId);

      toast.success("Analiza a fost salvată în backend.", {
        id: "bulkAnalyze",
      });
    } catch {
      toast.error("Analiza a eșuat", { id: "bulkAnalyze" });
    }
  };

  const openDetails = (cv: Cv) => {
    navigate(`${PATHS.DASHBOARD.ROOT}/cv/${cv.id}`, {
      state: {
        jobId: selectedJobId,
        jobTitle: selectedJob?.title,
      },
    });
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <aside className={styles.jobsPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.brandBlock}>
              <h2 className={styles.heroTitle}>
                CV-Analyzer <span>Studio</span>
              </h2>
              <p className={styles.heroSubtitle}>
                Încarcă CV-uri și pornește matching
              </p>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <input
              placeholder="Caută posturi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.jobScrollList}>
            {filteredJobs.map((job) => {
              const isSelected = selectedJobId === job.id;

              return (
                <button
                  key={job.id}
                  type="button"
                  className={[
                    styles.jobMiniCard,
                    isSelected ? styles.activeJob : "",
                    isSelected && job.status === "ACTIVE"
                      ? styles.selectedActive
                      : "",
                    isSelected && job.status === "CLOSED"
                      ? styles.selectedClosed
                      : "",
                  ].join(" ")}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div className={styles.miniCardLeft}>
                    <div className={styles.miniIconBox}>
                      <Briefcase />
                    </div>

                    <div className={styles.miniCardText}>
                      <h4 className={styles.miniTitle}>{job.title}</h4>

                      <div className={styles.miniSubtitleRow}>
                        <p className={styles.miniSub}>{job.location || "—"}</p>

                        {job.status && (
                          <span
                            className={[
                              styles.statusPill,
                              job.status === "ACTIVE"
                                ? styles.statusPillActive
                                : styles.statusPillClosed,
                            ].join(" ")}
                          >
                            {job.status === "ACTIVE" ? "Activ" : "Închis"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.rightMeta}>
                    <span className={styles.countPill}>
                      {cvCounts[job.id] ?? 0} CV
                    </span>
                  </div>
                </button>
              );
            })}

            {jobs.length === 0 && (
              <div className={styles.emptyPanel}>
                <p>Niciun job disponibil.</p>
              </div>
            )}
          </div>
        </aside>

        <main className={styles.mainArea}>
          {selectedJob ? (
            <>
              <header className={styles.contentHeader}>
                <div className={styles.jobMainInfo}>
                  <h1>{selectedJob.title}</h1>

                  <div className={styles.metaRow}>
                    {selectedJob.type && (
                      <span className={styles.typeTag}>
                        <Briefcase className={styles.metaIcon} />
                        {selectedJob.type}
                      </span>
                    )}

                    {selectedJob.createdAt && (
                      <span className={styles.dateTag}>
                        <CalendarIcon className={styles.metaIcon} />
                        {formatDate(selectedJob.createdAt)}
                      </span>
                    )}

                    {selectedJob.status && (
                      <span
                        className={[
                          styles.statusPill,
                          selectedJob.status === "ACTIVE"
                            ? styles.statusPillActive
                            : styles.statusPillClosed,
                        ].join(" ")}
                      >
                        {selectedJob.status === "ACTIVE" ? "Activ" : "Închis"}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.headerRightActions}>
                  <button
                    type="button"
                    className={styles.headerPrimaryBtn}
                    onClick={runAnalysis}
                    disabled={cvs.length === 0 || isClosed}
                    title={
                      isClosed
                        ? "Post închis, acțiunile sunt blocate"
                        : "Inițiază analiza"
                    }
                  >
                    <Robot />
                    Analizează
                  </button>

                  <div className={styles.statsCircle}>
                    <strong>{cvs.length}</strong>
                    <span>CV-uri</span>
                  </div>
                </div>
              </header>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.sectionTitle}>
                    <CloudUploadAlt />
                    <h3>Încărcare CV-uri</h3>
                  </div>

                  <span className={styles.helperPill}>PDF, DOCX, max 10MB</span>
                </div>

                <label
                  className={[
                    styles.uploadZone,
                    isDraggingFiles ? styles.uploadZoneDragging : "",
                    isClosed ? styles.uploadZoneDisabled : "",
                  ].join(" ")}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  title={isClosed ? "Post închis, upload blocat" : "Încarcă CV-uri"}
                >
                  <div className={styles.uploadIconPulse}>
                    <CloudUploadAlt />
                  </div>

                  <div className={styles.uploadText}>
                    <span>Drop CV-uri aici sau click pentru upload</span>
                    <small>Sistemul va atașa CV-urile jobului selectat.</small>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpload}
                    disabled={isClosed}
                  />
                </label>
              </section>

              <section className={`${styles.card} ${styles.tableCard}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.sectionTitle}>
                    <RegFilePdf />
                    <h3>Baza de date curentă</h3>
                  </div>

                  <span className={styles.countPillStrong}>
                    {cvs.length} fișiere
                  </span>
                </div>

                <div className={styles.tableScroll}>
                  {cvs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyCard}>
                        <div className={styles.emptyBadge}>
                          <RegFilePdf className={styles.emptyIcon} />
                        </div>

                        <h3 className={styles.emptyTitle}>
                          Niciun fișier asociat
                        </h3>
                        <p className={styles.emptyText}>
                          Încarcă CV-uri pentru acest job ca să începi matching-ul.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className={styles.crystalTable}>
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>Mărime</th>
                          <th>Data</th>
                          <th>Scor</th>
                          <th>Status</th>
                          <th>Detalii</th>
                          <th>Acțiune</th>
                        </tr>
                      </thead>

                      <tbody>
                        {cvs.map((cv) => (
                          <tr key={cv.id}>
                            <td className={styles.fileNameCell}>
                              <RegFilePdf className={styles.pdfIcon} />
                              <span className={styles.fileNameText}>
                                {cv.fileName}
                              </span>
                            </td>

                            <td>{formatSize(cv.fileSize ?? null)}</td>

                            <td>{formatDate(cv.uploadDate ?? cv.createdAt)}</td>

                            <td>{cv.matchScore ?? 0}%</td>

                            <td>{cv.status || "—"}</td>

                            <td>
                              <button
                                type="button"
                                className={styles.viewBtn}
                                onClick={() => openDetails(cv)}
                                aria-label="Vezi detalii"
                                title="Vezi detalii"
                              >
                                <EyeIcon />
                              </button>
                            </td>

                            <td>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(cv.id)}
                                aria-label="Șterge"
                                title="Șterge"
                                disabled={isClosed}
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
