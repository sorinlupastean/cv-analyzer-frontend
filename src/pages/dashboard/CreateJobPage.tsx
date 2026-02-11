import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./CreateJobPage.module.css";

import SearchIcon from "../../assets/search.svg";
import SortIcon from "../../assets/sort.svg";
import BriefcaseIcon from "../../assets/briefcase.svg";
import TrashIcon from "../../assets/trash.svg";

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  createdAt: string;
}

const CreateJobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    type: "Full-time",
    description: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("jobs");
    if (saved) setJobs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      location: "",
      type: "Full-time",
      description: "",
    });
    setEditingId(null);
    setMode("list");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "edit" && editingId) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingId ? { ...j, ...form } : j)),
      );
      toast.success("Job actualizat");
    } else {
      setJobs((prev) => [
        {
          id: Date.now(),
          ...form,
          createdAt: new Date().toLocaleDateString("ro-RO"),
        },
        ...prev,
      ]);
      toast.success("Job creat");
    }

    resetForm();
  };

  const remove = (id: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast.error("Job șters");
  };

  const edit = (job: Job) => {
    setForm({
      title: job.title,
      category: job.category,
      location: job.location,
      type: job.type,
      description: job.description,
    });
    setEditingId(job.id);
    setMode("edit");
  };

  const filtered = jobs
    .filter((j) => j.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return b.id - a.id;
      if (sort === "oldest") return a.id - b.id;
      if (sort === "az") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });

  return (
    <div className={styles.root}>
      <Toaster position="bottom-right" />

      {mode === "list" && (
        <header className={styles.topBar}>
          <div className={styles.left}>
            <div className={styles.search}>
              <img src={SearchIcon} width={18} />
              <input
                placeholder="Caută în baza de date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.sort} ref={sortRef}>
              <button
                className={styles.sortBtn}
                onClick={() => setShowSort((p) => !p)}
              >
                <img src={SortIcon} width={16} />
                <span>{sort.toUpperCase()}</span>
              </button>

              {showSort && (
                <div className={styles.dropdown}>
                  <p onClick={() => setSort("newest")}>Cele mai noi</p>
                  <p onClick={() => setSort("oldest")}>Cele mai vechi</p>
                  <p onClick={() => setSort("az")}>A - Z</p>
                  <p onClick={() => setSort("za")}>Z - A</p>
                </div>
              )}
            </div>
          </div>

          <button className={styles.primary} onClick={() => setMode("create")}>
            + Creează Anunț
          </button>
        </header>
      )}

      <main className={styles.content}>
        {mode === "list" ? (
          <section className={styles.list}>
            {filtered.map((job) => (
              <article
                key={job.id}
                className={styles.card}
                onClick={() => edit(job)}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.iconWrapper}>
                    <img src={BriefcaseIcon} width={22} />
                  </div>

                  <div className={styles.cardInfo}>
                    <h3>{job.title}</h3>
                    <div className={styles.meta}>
                      {job.category} • {job.location}
                    </div>
                    <span className={styles.badge}>{job.type}</span>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={styles.date}>{job.createdAt}</span>
                  <button
                    className={styles.trashBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(job.id);
                    }}
                  >
                    <img src={TrashIcon} width={18} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <h2>
              {mode === "edit"
                ? "Editare Parametri Job"
                : "Configurare Job Nou"}
            </h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Titlu poziție</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Categorie</label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Locație</label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tip contract</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                  <option>Internship</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Descriere detaliată</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={resetForm}
              >
                Anulează
              </button>
              <button type="submit" className={styles.primary}>
                Salvează
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default CreateJobPage;
