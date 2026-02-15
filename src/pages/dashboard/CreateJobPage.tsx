import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateJobPage.module.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { jobsApi, type JobStatus } from "../../api/jobs.service";
import { PATHS } from "../../routs/paths";

import {
  FaBriefcase,
  FaUserCircle,
  FaEye,
  FaEyeSlash,
  FaLightbulb,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaEdit,
  FaCalendarAlt,
  FaGraduationCap,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const UserCircle = FaUserCircle as unknown as ComponentType<IconBaseProps>;
const Eye = FaEye as unknown as ComponentType<IconBaseProps>;
const EyeSlash = FaEyeSlash as unknown as ComponentType<IconBaseProps>;
const Lightbulb = FaLightbulb as unknown as ComponentType<IconBaseProps>;
const Plus = FaPlus as unknown as ComponentType<IconBaseProps>;
const SearchIcon = FaSearch as unknown as ComponentType<IconBaseProps>;
const TrashIcon = FaTrash as unknown as ComponentType<IconBaseProps>;
const Times = FaTimes as unknown as ComponentType<IconBaseProps>;
const EditIcon = FaEdit as unknown as ComponentType<IconBaseProps>;
const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const CategoryIcon = FaGraduationCap as unknown as ComponentType<IconBaseProps>;

interface CVResult {
  id: number;
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
}

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  cvs: CVResult[];
}

type JobForm = {
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: JobStatus;
};

const CreateJobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hoveredCv, setHoveredCv] = useState<number | null>(null);
  const navigate = useNavigate();

  const [form, setForm] = useState<JobForm>({
    title: "",
    category: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await jobsApi.list();
        setJobs(data as any);
        setSelectedJob((data as any).length ? (data as any)[0] : null);
      } catch {
        toast.error("Nu pot încărca job-urile din backend");
      }
    })();
  }, []);

  const isClosed = selectedJob?.status === "CLOSED";

  const filteredJobs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => j.title.toLowerCase().includes(q));
  }, [jobs, searchTerm]);

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

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      location: "",
      type: "Full-time",
      description: "",
      requirements: "",
      status: "ACTIVE",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "",
      location: "",
      type: "Full-time",
      description: "",
      requirements: "",
      status: "ACTIVE",
    });
    setIsFormOpen(true);
  };

  const openEdit = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();

    if (job.status === "CLOSED") {
      toast.error(
        "Postul este închis. Poți doar să îl ștergi sau să îl activezi.",
      );
      return;
    }

    setForm({
      title: job.title,
      category: job.category,
      location: job.location ?? "",
      type: job.type,
      description: job.description,
      requirements: job.requirements ?? "",
      status: job.status ?? "ACTIVE",
    });
    setEditingId(job.id);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const updated = await jobsApi.update(editingId, form);
        setJobs((prev) =>
          prev.map((j) => (j.id === editingId ? (updated as any) : j)),
        );
        if (selectedJob?.id === editingId) setSelectedJob(updated as any);
        toast.success("Job actualizat!");
      } else {
        const created = await jobsApi.create(form as any);
        setJobs((prev) => [created as any, ...prev]);
        setSelectedJob(created as any);
        toast.success("Job creat!");
      }
      resetForm();
    } catch {
      toast.error("Eroare la salvare");
    }
  };

  const deleteJob = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobsApi.remove(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
      toast.success("Job șters");
    } catch {
      toast.error("Eroare la ștergere");
    }
  };

  const toggleStatus = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const next: JobStatus = job.status === "ACTIVE" ? "CLOSED" : "ACTIVE";

      const updated = await jobsApi.setStatus(job.id, next);

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? ({
                ...j,
                ...(updated as any),
                cvs: (updated as any).cvs ?? j.cvs,
              } as any)
            : j,
        ),
      );

      setSelectedJob((prev) =>
        prev?.id === job.id
          ? ({
              ...prev,
              ...(updated as any),
              cvs: (updated as any).cvs ?? prev.cvs,
            } as any)
          : prev,
      );

      toast.success(next === "CLOSED" ? "Post închis" : "Post activat");
    } catch (err) {
      console.error("toggleStatus error:", err);
      toast.error("Nu pot schimba statusul postului");
    }
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <Toaster position="bottom-right" />

        {/* JOBS PANEL */}
        <aside className={styles.jobsPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.brandBlock}>
              <h2 className={styles.heroTitle}>
                CV-Analyzer <span>Studio</span>
              </h2>
              <p className={styles.heroSubtitle}>
                Gestionare posturi și candidați
              </p>
            </div>

            <button className={styles.primaryBtn} onClick={openCreate}>
              <Plus /> Nou
            </button>
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
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;

              return (
                <div
                  key={job.id}
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
                  onClick={() => setSelectedJob(job)}
                >
                  <div className={styles.miniCardLeft}>
                    <div className={styles.miniIconBox}>
                      <Briefcase />
                    </div>

                    <div className={styles.miniCardText}>
                      <h4 className={styles.miniTitle}>{job.title}</h4>

                      <div className={styles.miniSubtitleRow}>
                        <p className={styles.miniSub}>{job.location || "—"}</p>

                        <span
                          className={`${styles.statusPill} ${
                            job.status === "ACTIVE"
                              ? styles.statusPillActive
                              : styles.statusPillClosed
                          }`}
                        >
                          {job.status === "ACTIVE" ? "Activ" : "Închis"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className={styles.miniActionsStack}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={(e) => openEdit(job, e)}
                        disabled={job.status === "CLOSED"}
                        title={
                          job.status === "CLOSED" ? "Post inchis" : "Editeaza"
                        }
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        className={`${styles.actionIconBtn} ${styles.dangerIconBtn}`}
                        onClick={(e) => deleteJob(job.id, e)}
                        title="Sterge"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className={styles.mainArea}>
          {selectedJob ? (
            <>
              <header className={styles.contentHeader}>
                <div className={styles.jobMainInfo}>
                  <h1>{selectedJob.title}</h1>
                  <div className={styles.metaRow}>
                    <span className={styles.typeTag}>
                      <Briefcase className={styles.metaIcon} />
                      {selectedJob.type}
                    </span>

                    <span className={styles.dateTag}>
                      <CalendarIcon className={styles.metaIcon} />
                      {formatDate(selectedJob.createdAt)}
                    </span>

                    <span className={styles.categoryTag}>
                      <CategoryIcon className={styles.metaIcon} />
                      {selectedJob.category}
                    </span>
                  </div>
                </div>

                <div className={styles.headerRightActions}>
                  <button
                    type="button"
                    className={`${styles.headerPrimaryBtn} ${
                      selectedJob.status === "ACTIVE"
                        ? styles.btnWarn
                        : styles.btnOk
                    }`}
                    onClick={(e) => toggleStatus(selectedJob, e as any)}
                    title={
                      selectedJob.status === "ACTIVE"
                        ? "Inchide postul"
                        : "Activeaza postul"
                    }
                  >
                    {selectedJob.status === "ACTIVE"
                      ? "Inchide post"
                      : "Activeaza post"}
                  </button>

                  <div className={styles.statsCircle}>
                    <strong>{selectedJob.cvs.length}</strong>
                    <span>CV-uri</span>
                  </div>
                </div>
              </header>

              {/* requirements preview */}
              <section className={styles.reqCard}>
                <div className={styles.reqHeader}>
                  <p className={styles.reqTitle}>Cerințe</p>
                </div>

                <p className={styles.reqText}>
                  {selectedJob.requirements?.trim()
                    ? selectedJob.requirements
                    : "—"}
                </p>
              </section>

              <div className={styles.cvContainer}>
                {selectedJob.cvs.length > 0 ? (
                  <div className={styles.cvGrid}>
                    {selectedJob.cvs.map((cv) => (
                      <div key={cv.id} className={styles.cvCard}>
                        <div className={styles.cvTop}>
                          <div className={styles.candidate}>
                            <UserCircle className={styles.userIcon} />
                            <div>
                              <h4>{cv.candidateName}</h4>
                              <p>{cv.fileName}</p>
                            </div>
                          </div>
                          <div className={styles.scoreBadge}>
                            {cv.matchScore}%
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.barContainer}>
                            <div
                              className={styles.barFill}
                              style={{ width: `${cv.matchScore}%` }}
                            />
                          </div>
                        </div>

                        <div className={styles.skills}>
                          {cv.skills.map((s) => (
                            <span key={s} className={styles.sTag}>
                              {s}
                            </span>
                          ))}
                        </div>

                        <button
                          className={styles.viewBtn}
                          disabled={isClosed}
                          title={
                            isClosed
                              ? "Post închis, acțiunile sunt blocate"
                              : "Vezi profil"
                          }
                          onMouseEnter={() => setHoveredCv(cv.id)}
                          onMouseLeave={() => setHoveredCv(null)}
                          onClick={() =>
                            navigate(`${PATHS.DASHBOARD.ROOT}/cv/${cv.id}`, {
                              state: {
                                fromResults: true,
                                jobId: selectedJob.id,
                              },
                            })
                          }
                        >
                          {hoveredCv === cv.id ? <Eye /> : <EyeSlash />}
                          Vezi Profil
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyCard}>
                      <div className={styles.emptyBadge}>
                        <Lightbulb className={styles.emptyIcon} />
                      </div>

                      <h3 className={styles.emptyTitle}>
                        Momentan nu există rezultate
                      </h3>
                      <p className={styles.emptyText}>
                        Încarcă CV-uri pentru acest post.
                      </p>

                      <div className={styles.emptyActions}>
                        <button
                          type="button"
                          className={styles.emptyPrimary}
                          disabled={isClosed}
                          title={
                            isClosed
                              ? "Post închis, nu mai poți încărca CV-uri"
                              : "Încarcă CV-uri"
                          }
                          onClick={() =>
                            navigate(
                              `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.UPLOAD_CV}`,
                              { state: { jobId: selectedJob.id } },
                            )
                          }
                        >
                          Încarcă CV-uri
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.noJobSelected}>
              <Briefcase size={30} />
              <h4>Selectează un post pentru a vedea datele</h4>
            </div>
          )}
        </main>

        {/* MODAL */}
        {isFormOpen && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editingId ? "Editare Post" : "Creează Post Nou"}</h2>
                <button className={styles.closeBtn} onClick={resetForm}>
                  <Times />
                </button>
              </div>

              <form onSubmit={handleSave} className={styles.unifiedForm}>
                <div className={styles.formGrid}>
                  <div className={styles.fGroup}>
                    <label>Titlu Poziție</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.fGroup}>
                    <label>Categorie</label>
                    <input
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.fGroup}>
                    <label>Tip</label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Remote</option>
                      <option>Internship</option>
                    </select>
                  </div>

                  <div className={styles.fGroup}>
                    <label>Locație</label>
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  </div>

                  <div className={`${styles.fGroup} ${styles.fullWidth}`}>
                    <label>Descriere</label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div className={`${styles.fGroup} ${styles.fullWidth}`}>
                    <label>Cerințe</label>
                    <textarea
                      required
                      rows={4}
                      value={form.requirements}
                      onChange={(e) =>
                        setForm({ ...form, requirements: e.target.value })
                      }
                      placeholder="Ex: comunicare, lucru în echipă, experiență relevantă..."
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={styles.cancelBtn}
                  >
                    Anulează
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Salvează
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateJobPage;
