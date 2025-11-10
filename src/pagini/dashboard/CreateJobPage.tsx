import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchIcon from "../../assets/search.svg";
import SortIcon from "../../assets/sort.svg";
import Briefcase from "../../assets/briefcase.svg";
import Trash from "../../assets/trash.svg";
import toast, { Toaster } from "react-hot-toast";
import "./CreateJobPage.css";

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
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("jobs");
    if (stored) setJobs(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setJobTitle("");
    setJobCategory("");
    setJobLocation("");
    setJobType("Full-time");
    setJobDescription("");
    setIsCreating(false);
    setIsEditing(false);
    setEditingJobId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingJobId !== null) {
      // actualizează jobul existent
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === editingJobId
            ? {
                ...job,
                title: jobTitle,
                category: jobCategory,
                location: jobLocation,
                type: jobType,
                description: jobDescription,
              }
            : job
        )
      );
      toast.success("Job actualizat cu succes!");
    } else {
      // creează job nou
      const newJob: Job = {
        id: Date.now(),
        title: jobTitle,
        category: jobCategory,
        location: jobLocation,
        type: jobType,
        description: jobDescription,
        createdAt: new Date().toLocaleDateString("ro-RO"),
      };
      setJobs((prev) => [...prev, newJob]);
      toast.success("Job creat cu succes!");
    }

    resetForm();
  };

  const handleDelete = (id: number) => {
    setJobs(jobs.filter((job) => job.id !== id));
    toast.error("Job șters.");
  };

  const handleEdit = (job: Job) => {
    setIsEditing(true);
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobCategory(job.category);
    setJobLocation(job.location);
    setJobType(job.type);
    setJobDescription(job.description || "");
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === "newest") return b.id - a.id;
    if (sortOrder === "oldest") return a.id - b.id;
    if (sortOrder === "az") return a.title.localeCompare(b.title);
    if (sortOrder === "za") return b.title.localeCompare(a.title);
    return 0;
  });

  return (
    <DashboardLayout pageTitle="Creează Job">
      <div className="create-job-page-container">
        <Toaster position="top-right" />

        {!isCreating && !isEditing && (
          <div className="top-bar">
            <div className="actions-left">
              <div className="search-bar">
                <img src={SearchIcon} alt="search" className="search-icon" />
                <input
                  type="text"
                  placeholder="Caută job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="sort-container" ref={sortRef}>
                <button
                  className="sort-toggle"
                  onClick={() => setShowSortMenu((prev) => !prev)}
                >
                  <img src={SortIcon} alt="sort" className="sort-icon" />
                  <span>Sortare după:</span>
                  <strong>
                    {sortOrder === "newest"
                      ? "Cele mai noi"
                      : sortOrder === "oldest"
                      ? "Cele mai vechi"
                      : sortOrder === "az"
                      ? "A–Z"
                      : "Z–A"}
                  </strong>
                </button>

                {showSortMenu && (
                  <div className="sort-dropdown">
                    <p onClick={() => setSortOrder("newest")}>Cele mai noi</p>
                    <p onClick={() => setSortOrder("oldest")}>Cele mai vechi</p>
                    <p onClick={() => setSortOrder("az")}>A–Z</p>
                    <p onClick={() => setSortOrder("za")}>Z–A</p>
                  </div>
                )}
              </div>
            </div>

            <button className="create-btn" onClick={() => setIsCreating(true)}>
              + Creează
            </button>
          </div>
        )}

        {!isCreating && !isEditing ? (
          <div className="job-list-container">
            {sortedJobs.length === 0 ? (
              <div className="no-jobs">
                <img src={Briefcase} alt="empty" className="no-jobs-icon" />
                <p>Nu există joburi create încă.</p>
              </div>
            ) : (
              sortedJobs.map((job) => (
                <div
                  key={job.id}
                  className="modern-job-card"
                  onClick={() => handleEdit(job)} // 🔹 click = editare
                >
                  <div className="job-left">
                    <div className="job-icon">
                      <img src={Briefcase} alt="briefcase" />
                    </div>

                    <div className="job-info">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-meta">
                        <span className="job-category">{job.category}</span> •{" "}
                        <span className="job-location">{job.location}</span>
                      </p>

                      <div className="job-tags">
                        <span className="badge-type">{job.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="job-right">
                    <span className="job-date">{job.createdAt}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // prevenim trigger-ul de edit
                        handleDelete(job.id);
                      }}
                    >
                      <img src={Trash} alt="delete" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="create-job-wrapper">
            <form className="create-job-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titlu Job</label>
                <input
                  type="text"
                  placeholder="Ex: Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categorie</label>
                <input
                  type="text"
                  placeholder="Ex: IT & Software"
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Locație</label>
                <input
                  type="text"
                  placeholder="Ex: Remote"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tipul Jobului</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                  <option>Internship</option>
                </select>
              </div>

              <div className="form-group description-group">
                <label>Descriere Job</label>
                <textarea
                  placeholder="Ex: Responsabil cu dezvoltarea componentelor frontend..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm}>
                  Anulează
                </button>
                <button type="submit" className="btn-submit">
                  {isEditing ? "Salvează" : "Creează Job"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateJobPage;
