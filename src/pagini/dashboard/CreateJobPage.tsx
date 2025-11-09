import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
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
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: "Frontend Developer",
      category: "IT & Software",
      location: "Remote",
      type: "Full-time",
      description: "Responsabil cu implementarea componentelor UI în React.",
      createdAt: "05.11.2025",
    },
  ]);

  // Controlăm dacă e modul creare sau editare
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // State pentru formular (reutilizate la creare și editare)
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDescription, setJobDescription] = useState("");

  // Resetare formular
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

  // Creare job nou
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingJobId !== null) {
      // actualizare job existent
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
    } else {
      // creare job nou
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
    }

    resetForm();
  };

  // Ștergere job
  const handleDelete = (id: number) => {
    if (window.confirm("Sigur vrei să ștergi acest job?")) {
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  // Editare job existent
  const handleEdit = (job: Job) => {
    setIsEditing(true);
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobCategory(job.category);
    setJobLocation(job.location);
    setJobType(job.type);
    setJobDescription(job.description);
  };

  return (
    <DashboardLayout pageTitle="Creează Job">
      <div className="create-job-page-container">
        {/* 🔹 Bara de sus (fără search) */}
        {!isCreating && !isEditing && (
          <div className="top-bar">
            <button className="create-btn" onClick={() => setIsCreating(true)}>
              + Creează
            </button>
          </div>
        )}

        {/* 🔹 Afișare condiționată */}
        {!isCreating && !isEditing ? (
          // --- LISTA DE JOBURI ---
          <div className="job-list-container">
            {jobs.length === 0 ? (
              <p className="no-jobs">Nu există joburi create încă.</p>
            ) : (
              <div className="job-cards-grid">
                {jobs.map((job) => (
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
          // --- FORMULAR CREARE / EDITARE ---
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
