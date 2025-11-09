import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchIcon from "../../assets/search.svg";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const resetForm = () => {
    setJobTitle("");
    setJobCategory("");
    setJobLocation("");
    setJobType("Full-time");
    setJobDescription("");
    setEditingJobId(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingJobId !== null) {
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
      toast.success("Modificările au fost salvate!");
    } else {
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
    if (window.confirm("Sigur vrei să ștergi acest job?")) {
      setJobs(jobs.filter((job) => job.id !== id));
      toast.error("Job șters."); // ✅ Toast ștergere
    }
  };

  const handleEdit = (job: Job) => {
    setIsEditing(true);
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobCategory(job.category);
    setJobLocation(job.location);
    setJobType(job.type);
    setJobDescription(job.description);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Creează Job">
      <div className="create-job-page-container">
        <Toaster position="top-right" reverseOrder={false} />{" "}
        {/* ✅ container toast */}
        {!isCreating && !isEditing && (
          <div className="top-bar">
            <div className="search-bar">
              <img src={SearchIcon} alt="search" className="search-icon" />
              <input
                type="text"
                placeholder="Caută job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="create-btn" onClick={() => setIsCreating(true)}>
              + Creează
            </button>
          </div>
        )}
        {!isCreating && !isEditing ? (
          <div className="job-list-container">
            {filteredJobs.length === 0 ? (
              <p className="no-jobs">Nu există joburi create încă.</p>
            ) : (
              <div className="job-cards-grid">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="job-card"
                    onClick={() => handleEdit(job)}
                  >
                    <h3>{job.title}</h3>
                    <p className="category">{job.category}</p>
                    <p className="details">
                      📍 {job.location} | {job.type}
                    </p>
                    <p className="description-preview">
                      {job.description.length > 70
                        ? job.description.slice(0, 70) + "..."
                        : job.description}
                    </p>
                    <div className="footer">
                      <span>{job.createdAt}</span>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="create-job-wrapper">
            <h2>{isEditing ? "Editare Job" : "Creare Job Nou"}</h2>

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
