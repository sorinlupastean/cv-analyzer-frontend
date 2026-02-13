import React, { useState, useEffect } from "react";
import styles from "./CreateJobPage.module.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { jobsApi } from "../../api/jobs.service";
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
  createdAt: string;
  cvs: CVResult[];
}

const CreateJobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hoveredCv, setHoveredCv] = useState<number | null>(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    type: "Full-time",
    description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await jobsApi.list(); // acum e Job[]
        setJobs(data);
        setSelectedJob(data.length ? data[0] : null);
      } catch (err) {
        toast.error("Nu pot încărca job-urile din backend");
      }
    })();
  }, []);

  useEffect(() => {
    if (jobs.length > 0)
      localStorage.setItem("jobs_unified", JSON.stringify(jobs));
  }, [jobs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await jobsApi.update(editingId, form);
        setJobs((prev) =>
          prev.map((j) => (j.id === editingId ? { ...j, ...updated } : j)),
        );
        if (selectedJob?.id === editingId)
          setSelectedJob((prev) => (prev ? { ...prev, ...updated } : prev));
        toast.success("Job actualizat!");
      } else {
        const created = await jobsApi.create(form);
        setJobs((prev) => [created as any, ...prev]);
        setSelectedJob(created as any);
        toast.success("Job creat!");
      }
      resetForm();
    } catch (err) {
      toast.error("Eroare la salvare");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      location: "",
      type: "Full-time",
      description: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEdit = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({
      title: job.title,
      category: job.category,
      location: job.location,
      type: job.type,
      description: job.description,
    });
    setEditingId(job.id);
    setIsFormOpen(true);
  };

  const deleteJob = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobsApi.remove(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
      toast.success("Job șters");
    } catch (err) {
      toast.error("Eroare la ștergere");
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <Toaster position="bottom-right" />

        {/* JOBS PANEL */}
        <aside className={styles.jobsPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.brandBlock}>
              <h2 className={styles.heroTitle}>
                Recruit<span>AI</span>
              </h2>
              <p className={styles.heroSubtitle}>Manage jobs and candidates</p>
            </div>
            <button
              className={styles.primaryBtn}
              onClick={() => setIsFormOpen(true)}
            >
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
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`${styles.jobMiniCard} ${
                  selectedJob?.id === job.id ? styles.activeJob : ""
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className={styles.miniCardLeft}>
                  <div className={styles.miniIconBox}>
                    <Briefcase />
                  </div>
                  <div>
                    <h4>{job.title}</h4>
                    <p>{job.location}</p>
                  </div>
                </div>
                <div className={styles.miniCardActions}>
                  <button type="button" onClick={(e) => openEdit(job, e)}>
                    <EditIcon />
                  </button>
                  <button type="button" onClick={(e) => deleteJob(job.id, e)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
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
                    <span className={styles.typeTag}>{selectedJob.type}</span>
                    <span className={styles.dateTag}>
                      {selectedJob.createdAt}
                    </span>
                    <span className={styles.categoryTag}>
                      {selectedJob.category}
                    </span>
                  </div>
                </div>
                <div className={styles.statsCircle}>
                  <strong>{selectedJob.cvs.length}</strong>
                  <span>CV-uri</span>
                </div>
              </header>

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
                  <div className={styles.emptyResults}>
                    <Lightbulb className={styles.emptyIcon} />
                    <h3>Nicio analiză disponibilă</h3>
                    <p>Încarcă CV-uri pentru a începe procesul de matching.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.noJobSelected}>
              <Briefcase size={30} />
              <h4>Selectează un job pentru a vedea datele</h4>
            </div>
          )}
        </main>

        {/* MODAL */}
        {isFormOpen && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editingId ? "Editare Job" : "Creează Job Nou"}</h2>
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
                    Salvează Modificările
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
