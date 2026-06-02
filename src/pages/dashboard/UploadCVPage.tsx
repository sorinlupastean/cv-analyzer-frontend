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

const SELECTED_JOB_STORAGE_KEY = "upload-cv:selected-job-id";

const isAnalyzedCv = (cv: Cv): boolean => {
  const status = String(cv.status ?? "").toLowerCase();
  return status.includes("analiz") || Boolean(cv.analysisRaw);
};

const readStoredJobId = (): number | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SELECTED_JOB_STORAGE_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const UploadCVPage: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(() =>
    readStoredJobId(),
  );

  const [cvs, setCvs] = useState<Cv[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [analyzedCvCounts, setAnalyzedCvCounts] = useState<
    Record<number, number>
  >({});
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedJobId === null) {
      window.localStorage.removeItem(SELECTED_JOB_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      SELECTED_JOB_STORAGE_KEY,
      String(selectedJobId),
    );
  }, [selectedJobId]);

  useEffect(() => {
    (async () => {
      try {
        const data = (await jobsApi.list()) as JobLite[] | null;
        const jobsList = data ?? [];

        setJobs(jobsList);

        setSelectedJobId((current) => {
          if (current && jobsList.some((job) => job.id === current)) {
            return current;
          }

          const stored = readStoredJobId();
          if (stored && jobsList.some((job) => job.id === stored)) {
            return stored;
          }

          return jobsList.length ? jobsList[0].id : null;
        });

        const pairs = await Promise.all(
          jobsList.map(async (job) => {
            try {
              const list = await cvsApi.listForJob(job.id);
              return [job.id, list.filter(isAnalyzedCv).length] as const;
            } catch {
              return [job.id, 0] as const;
            }
          }),
        );

        setAnalyzedCvCounts(Object.fromEntries(pairs));
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
    return jobs.filter((job) => job.title.toLowerCase().includes(q));
  }, [jobs, searchTerm]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const isClosed = selectedJob?.status === "CLOSED";

  const { pendingCvs, analyzedCvs } = useMemo(() => {
    const pending = cvs.filter((cv) => !isAnalyzedCv(cv));
    const analyzed = cvs.filter((cv) => isAnalyzedCv(cv));

    return {
      pendingCvs: pending,
      analyzedCvs: analyzed,
    };
  }, [cvs]);

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

    setAnalyzedCvCounts((prev) => ({
      ...prev,
      [jobId]: refreshed.filter(isAnalyzedCv).length,
    }));
  };

  const canUploadFiles = (showMessage = true) => {
    if (!selectedJobId) {
      if (showMessage) {
        toast.error("Selectează un job înainte să încarci CV-uri.");
      }
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

    const results = await Promise.allSettled(
      acceptedFiles.map((file) => cvsApi.uploadForJob(selectedJobId!, file)),
    );

    let refreshFailed = false;
    try {
      await refreshCvs(selectedJobId!);
    } catch {
      refreshFailed = true;
    }

    const successCount = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failedCount = acceptedFiles.length - successCount;

    if (failedCount === 0) {
      toast.success(`${successCount} fișier(e) încărcate.`);
      if (refreshFailed) {
        toast.error(
          "Fișierele au fost încărcate, dar lista nu s-a putut sincroniza imediat.",
        );
      }
      return;
    }

    if (successCount > 0) {
      toast.error(
        `Am încărcat ${successCount} fișier(e), dar ${failedCount} nu au putut fi salvate.`,
      );
      if (refreshFailed) {
        toast.error(
          "Lista nu s-a putut sincroniza imediat după upload.",
        );
      }
      return;
    }

    toast.error("Upload eșuat.");
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
    if (!selectedJobId || pendingCvs.length === 0) return;

    if (isClosed) {
      toast.error("Post închis, analiza este blocată.");
      return;
    }

    const failedFiles: string[] = [];
    let analyzedCount = 0;

    try {
      toast.loading("Rulez analiza pentru CV-urile noi...", {
        id: "bulkAnalyze",
      });

      for (let i = 0; i < pendingCvs.length; i++) {
        const cv = pendingCvs[i];

        toast.loading(`Analizez ${i + 1}/${pendingCvs.length}: ${cv.fileName}...`, {
          id: "bulkAnalyze",
        });

        try {
          const updated = await cvsApi.analyzeForJob(selectedJobId, cv.id);
          analyzedCount += 1;
          setCvs((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
        } catch {
          failedFiles.push(cv.fileName);
        }
      }

      let refreshFailed = false;
      try {
        await refreshCvs(selectedJobId);
      } catch {
        refreshFailed = true;
      }

      if (failedFiles.length === 0) {
        toast.success(`Au fost analizate ${analyzedCount} CV-uri noi.`, {
          id: "bulkAnalyze",
        });
        if (refreshFailed) {
          toast.error(
            "Analiza a fost salvată, dar lista nu s-a putut sincroniza imediat.",
            { id: "bulkAnalyze-sync" },
          );
        }
        return;
      }

      const failedPreview = failedFiles.slice(0, 3).join(", ");
      const failedTail =
        failedFiles.length > 3 ? ` și încă ${failedFiles.length - 3}` : "";

      if (analyzedCount > 0) {
        toast.error(
          `Am analizat ${analyzedCount} CV-uri, dar au rămas nereușite: ${failedPreview}${failedTail}.`,
          { id: "bulkAnalyze" },
        );
        if (refreshFailed) {
          toast.error(
            "Lista nu s-a putut sincroniza imediat după analiză.",
            { id: "bulkAnalyze-sync" },
          );
        }
        return;
      }

      toast.error(
        `Nu am putut analiza CV-urile selectate: ${failedPreview}${failedTail}.`,
        { id: "bulkAnalyze" },
      );
      if (refreshFailed) {
        toast.error(
          "Lista nu s-a putut sincroniza imediat după analiză.",
          { id: "bulkAnalyze-sync" },
        );
      }
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
                      {analyzedCvCounts[job.id] ?? 0} analizate
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
                    disabled={pendingCvs.length === 0 || isClosed}
                    title={
                      isClosed
                        ? "Post închis, acțiunile sunt blocate"
                        : pendingCvs.length === 0
                          ? "Nu există CV-uri noi de analizat"
                          : "Inițiază analiza"
                    }
                  >
                    <Robot />
                    Analizează
                  </button>

                  <div className={styles.statsCircle}>
                    <strong>{pendingCvs.length}</strong>
                    <span>În așteptare</span>
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
                    <h3>CV-uri în așteptare</h3>
                  </div>

                  <span className={styles.countPillStrong}>
                    {pendingCvs.length} noi
                  </span>
                </div>

                <div className={styles.tableScroll}>
                  {pendingCvs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyCard}>
                        <div className={styles.emptyBadge}>
                          <RegFilePdf className={styles.emptyIcon} />
                        </div>

                        <h3 className={styles.emptyTitle}>
                          Nu există CV-uri noi
                        </h3>
                        <p className={styles.emptyText}>
                          Când adaugi CV-uri pentru acest job, ele apar aici până
                          la analiză.
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
                          <th>Status</th>
                          <th>Acțiune</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pendingCvs.map((cv) => (
                          <tr key={cv.id}>
                            <td className={styles.fileNameCell}>
                              <RegFilePdf className={styles.pdfIcon} />
                              <span className={styles.fileNameText}>
                                {cv.fileName}
                              </span>
                            </td>

                            <td>{formatSize(cv.fileSize ?? null)}</td>

                            <td>{formatDate(cv.uploadDate ?? cv.createdAt)}</td>

                            <td>În așteptare</td>

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

              {analyzedCvs.length > 0 ? (
                <section className={`${styles.card} ${styles.tableCard}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.sectionTitle}>
                      <EyeIcon />
                      <h3>CV-uri analizate</h3>
                    </div>

                    <span className={styles.countPillStrong}>
                      {analyzedCvs.length} analizate
                    </span>
                  </div>

                  <div className={styles.tableScroll}>
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
                        {analyzedCvs.map((cv) => (
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
                  </div>
                </section>
              ) : null}
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
