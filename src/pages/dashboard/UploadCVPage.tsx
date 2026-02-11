import React, { useEffect, useState } from "react";
import Notification from "../../components/Notification/Notification";
import "./UploadCVPage.css";

// --- IMPORT REACT ICONS ---
import {
  FaCloudUploadAlt,
  FaRegFilePdf,
  FaTrashAlt,
  FaChevronDown,
  FaRobot,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const CloudUploadAlt =
  FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const RegFilePdf = FaRegFilePdf as unknown as ComponentType<IconBaseProps>;
const TrashAlt = FaTrashAlt as unknown as ComponentType<IconBaseProps>;
const ChevronDown = FaChevronDown as unknown as ComponentType<IconBaseProps>;
const Robot = FaRobot as unknown as ComponentType<IconBaseProps>;

interface Job {
  id: number;
  title: string;
}

interface UploadedCV {
  id: number;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  jobId: number;
}

const UploadCVPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | "">("");
  const [uploadedCVs, setUploadedCVs] = useState<UploadedCV[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const storedJobs = localStorage.getItem("jobs");
    if (storedJobs) setJobs(JSON.parse(storedJobs));

    const storedCVs = localStorage.getItem("uploadedCVs");
    if (storedCVs) setUploadedCVs(JSON.parse(storedCVs));
  }, []);

  useEffect(() => {
    localStorage.setItem("uploadedCVs", JSON.stringify(uploadedCVs));
  }, [uploadedCVs]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!selectedJob) {
      setNotification({
        type: "error",
        title: "SISTEM BLOCAT",
        message: "Selectează un post țintă pentru asimilarea datelor.",
      });
      return;
    }

    if (!files || files.length === 0) return;

    const newFiles: UploadedCV[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      uploadDate: new Date().toLocaleDateString("ro-RO"),
      jobId: Number(selectedJob),
    }));

    setUploadedCVs((prev) => [...prev, ...newFiles]);

    setNotification({
      type: "success",
      title: "DOCUMENTE ÎNCĂRCATE",
      message: `${newFiles.length} unități de date au fost stocate.`,
    });
  };

  const handleDelete = (id: number) => {
    setUploadedCVs((prev) => prev.filter((cv) => cv.id !== id));
    setNotification({
      type: "error",
      title: "UNITATE ELIMINATĂ",
      message: "Fișierul a fost șters din serverele locale.",
    });
  };

  const filteredCVs = uploadedCVs.filter((cv) => cv.jobId === selectedJob);

  return (
    <div className="upload-page">
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="upload-card">
        {/* === HEADER === */}
        <div className="upload-header">
          <div className="header-left">
            <h2>Asimilare Resurse Umane</h2>
            <p>
              Conectează CV-urile la posturile vacante pentru procesare
              biometrică.
            </p>
          </div>

          {/* === DROPDOWN CUSTOM === */}
          <div className="custom-dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedJob
                  ? jobs.find((j) => j.id === selectedJob)?.title
                  : "Selectează Job Destinație"}
              </span>
              <ChevronDown
                className={`arrow-icon ${isDropdownOpen ? "rotate" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {jobs.length === 0 ? (
                  <p className="no-jobs-option">Niciun job activ în rețea</p>
                ) : (
                  jobs.map((job) => (
                    <p
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {job.title}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* === ZONA UPLOAD === */}
        <div className="upload-zone">
          <label htmlFor="file-upload" className="upload-label">
            <div className="upload-icon-pulse">
              <CloudUploadAlt size={45} />
            </div>
            <span>Drop CV-uri aici sau click pentru explorare</span>
            <small>Formate acceptate: PDF, DOCX (Max 10MB)</small>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* === LISTA DE FIȘIERE === */}
        <div className="uploaded-section">
          <div className="uploaded-header">
            <div className="section-title">
              <RegFilePdf />
              <h3>Baza de date curentă</h3>
            </div>
            {filteredCVs.length > 0 && (
              <button
                className="analyze-btn"
                onClick={() => {
                  setNotification({
                    type: "success",
                    title: "ANALIZĂ IA ACTIVATĂ",
                    message: "Scanăm abilitățile candidaților...",
                  });
                  setTimeout(() => {
                    setNotification({
                      type: "success",
                      title: "SINAPSĂ COMPLETĂ",
                      message: "Datele au fost agregate în Dashboard.",
                    });
                  }, 2000);
                }}
              >
                <Robot style={{ marginRight: "8px" }} />
                Inițiază Analiza
              </button>
            )}
          </div>

          <div className="uploaded-list-container">
            {filteredCVs.length === 0 ? (
              <div className="no-cv">
                <RegFilePdf size={40} style={{ opacity: 0.2 }} />
                <p>Niciun fișier asociat acestui post.</p>
              </div>
            ) : (
              <table className="crystal-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Mărime</th>
                    <th>Data Sincronizării</th>
                    <th>Acțiune</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCVs.map((cv) => (
                    <tr key={cv.id}>
                      <td className="file-name-cell">
                        <RegFilePdf className="pdf-icon" />
                        {cv.fileName}
                      </td>
                      <td>{cv.fileSize}</td>
                      <td>{cv.uploadDate}</td>
                      <td>
                        <button
                          className="delete-btn-crystal"
                          onClick={() => handleDelete(cv.id)}
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
        </div>
      </div>
    </div>
  );
};

export default UploadCVPage;
