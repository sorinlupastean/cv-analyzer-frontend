import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./CreateJobPage.css";

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  createdAt: string;
}

const CreateJobPage: React.FC = () => {
  // Lista joburilor existente
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: "Frontend Developer",
      category: "IT & Software",
      location: "Remote",
      type: "Full-time",
      createdAt: "05.11.2025",
    },
  ]);

  // Controlăm starea: listă sau creare
  const [isCreating, setIsCreating] = useState(false);

  // State pentru formular
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJob: Job = {
      id: Date.now(),
      title: jobTitle,
      category: jobCategory,
      location: jobLocation,
      type: jobType,
      createdAt: new Date().toLocaleDateString("ro-RO"),
    };

    setJobs((prev) => [...prev, newJob]);
    setIsCreating(false);

    // Resetare form
    setJobTitle("");
    setJobCategory("");
    setJobLocation("");
    setJobType("Full-time");
  };

  // Ștergere job
  const handleDelete = (id: number) => {
    if (window.confirm("Sigur vrei să ștergi acest job?")) {
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  return (
    <DashboardLayout pageTitle="Creează Job">
      <div className="create-job-page-container">
        {/* 1️⃣ Bara de sus */}
        <div className="top-bar">
          <input
            type="text"
            placeholder="Caută job..."
            className="search-input"
          />
          {!isCreating && (
            <button className="create-btn" onClick={() => setIsCreating(true)}>
              + Creează
            </button>
          )}
        </div>

        {/* 2️⃣ Afișare în funcție de stare */}
        {!isCreating ? (
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
                    onClick={() => alert(`Editare: ${job.title}`)}
                  >
                    <h3>{job.title}</h3>
                    <p className="category">{job.category}</p>
                    <p className="details">
                      📍 {job.location} | {job.type}
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
          // --- FORMULARUL DE CREARE JOB ---
          <div className="create-job-wrapper">
            <h2>Creare Job Nou</h2>

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

              <div className="form-actions">
                <button type="button" onClick={() => setIsCreating(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn-submit">
                  Creează Job
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
