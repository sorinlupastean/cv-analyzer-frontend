import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateJobPage.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { jobsApi, type JobStatus } from "../../api/jobs.service";
import JobModal from "../../components/JobModal/JobModal";
import { PATHS } from "../../routs/paths";

import {
  FaBriefcase,
  FaUserCircle,
  FaLightbulb,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaEdit,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const UserCircle = FaUserCircle as unknown as ComponentType<IconBaseProps>;
const Lightbulb = FaLightbulb as unknown as ComponentType<IconBaseProps>;
const Plus = FaPlus as unknown as ComponentType<IconBaseProps>;
const SearchIcon = FaSearch as unknown as ComponentType<IconBaseProps>;
const TrashIcon = FaTrash as unknown as ComponentType<IconBaseProps>;
const EditIcon = FaEdit as unknown as ComponentType<IconBaseProps>;
const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const CategoryIcon = FaGraduationCap as unknown as ComponentType<IconBaseProps>;
const FileIcon = FaFileAlt as unknown as ComponentType<IconBaseProps>;

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

  const location = useLocation();
  const openJobId = (location.state as any)?.openJobId as number | undefined;

  useEffect(() => {
    if (!openJobId) return;
    if (!jobs.length) return;
    const found = jobs.find((j) => j.id === openJobId);
    if (found) setSelectedJob(found);
  }, [openJobId, jobs]);

  useEffect(() => {
    (async () => {
      try {
        const data = (await jobsApi.list()) as any[];
        setJobs(data as any);
        const openId = (location.state as any)?.openJobId as number | undefined;
        const found = openId ? data.find((j) => j.id === openId) : null;
        setSelectedJob(found ?? (data.length ? data[0] : null));
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

  const [reqExpanded, setReqExpanded] = useState(false);

  useEffect(() => {
    setReqExpanded(false);
  }, [selectedJob?.id]);

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>

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
              <Plus size={12} /> Nou
            </button>
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
                  <button
                    type="button"
                    className={styles.reqToggleBtn}
                    onClick={() => setReqExpanded((v) => !v)}
                    title={reqExpanded ? "Micșorează" : "Vezi mai mult"}
                  >
                    {reqExpanded ? "Micșorează" : "Vezi mai mult"}
                  </button>
                </div>
                <p
                  className={[
                    styles.reqText,
                    reqExpanded
                      ? styles.reqTextExpanded
                      : styles.reqTextClamped,
                  ].join(" ")}
                >
                  {selectedJob.requirements?.trim()
                    ? selectedJob.requirements
                    : "—"}
                </p>
              </section>

              <div className={styles.cvContainer}>
                {selectedJob.cvs.length > 0 ? (
                  <div className={styles.cvGrid}>
                    {selectedJob.cvs.map((cv) => {
                      const topSkills = (cv.skills ?? [])
                        .filter(Boolean)
                        .slice(0, 2);
                      return (
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
                            {topSkills.length > 0 ? (
                              topSkills.map((s: string) => (
                                <span key={s} className={styles.sTag}>
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className={styles.skillsEmpty}>
                                Competențe neidentificate
                              </span>
                            )}
                          </div>

                          <p className={styles.skillsHint}>
                            Competențe principale (din CV)
                          </p>

                          <button
                            className={styles.viewBtn}
                            disabled={isClosed}
                            title={
                              isClosed
                                ? "Post închis, acțiunile sunt blocate"
                                : "Vezi detalii CV"
                            }
                            onClick={() =>
                              navigate(`${PATHS.DASHBOARD.ROOT}/cv/${cv.id}`, {
                                state: {
                                  fromResults: true,
                                  jobId: selectedJob.id,
                                },
                              })
                            }
                          >
                            <FileIcon />
                            Vezi detalii
                          </button>
                        </div>
                      );
                    })}
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
                              {
                                state: { jobId: selectedJob.id },
                              },
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
              <Briefcase size={20} />
              <h4>Selectează un post pentru a vedea datele</h4>
            </div>
          )}
        </main>

        {/* MODAL */}
        <JobModal
          isOpen={isFormOpen}
          isEditing={Boolean(editingId)}
          form={form}
          setForm={setForm}
          onClose={resetForm}
          onSubmit={handleSave}
        />
      </div>
    </div>
  );
};

export default CreateJobPage;
