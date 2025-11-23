import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import UploadIcon from "../../assets/upload.svg";
import FileIcon from "../../assets/file.svg";
import Trash from "../../assets/trash.svg";
import toast, { Toaster } from "react-hot-toast";
import "./UploadCVPage.css";

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
    if (!files || !selectedJob) {
      toast.error("Selectează mai întâi un job!");
      return;
    }

    const newFiles: UploadedCV[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      uploadDate: new Date().toLocaleDateString("ro-RO"),
      jobId: Number(selectedJob),
    }));

    setUploadedCVs((prev) => [...prev, ...newFiles]);
    toast.success("CV-urile au fost încărcate!");
  };

  const handleDelete = (id: number) => {
    setUploadedCVs((prev) => prev.filter((cv) => cv.id !== id));
    toast.error("CV șters.");
  };

  const filteredCVs = uploadedCVs.filter((cv) => cv.jobId === selectedJob);

  return (
    <DashboardLayout pageTitle="Încarcă CV-uri">
      <div className="upload-page">
        <Toaster position="top-right" />

        <div className="upload-card">
          {/* === HEADER === */}
          <div className="upload-header">
            <div className="header-left">
              <h2>Încărcare CV-uri</h2>
              <p>
                Selectează un job și încarcă fișierele candidaților pentru
                analiză.
              </p>
            </div>

            {/* === DROPDOWN CUSTOM === */}
            <div className="custom-dropdown">
              <button
                className="dropdown-toggle"
                onClick={(e) => {
                  e.preventDefault();
                  const menu = document.querySelector(".dropdown-menu");
                  menu?.classList.toggle("active");
                }}
              >
                <span>
                  {selectedJob
                    ? jobs.find((j) => j.id === selectedJob)?.title
                    : "Selectează un job..."}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="arrow-icon"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="dropdown-menu">
                {jobs.length === 0 ? (
                  <p className="no-jobs-option">Nu există joburi disponibile</p>
                ) : (
                  jobs.map((job) => (
                    <p
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job.id);
                        document
                          .querySelector(".dropdown-menu")
                          ?.classList.remove("active");
                      }}
                    >
                      {job.title}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* === ZONA UPLOAD === */}
          <div className="upload-zone">
            <label htmlFor="file-upload" className="upload-label">
              <img src={UploadIcon} alt="upload" />
              <span>Trage fișiere aici sau fă click pentru a le încărca</span>
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
              <h3>CV-uri încărcate</h3>
              {filteredCVs.length > 0 && (
                <button
                  className="analyze-btn"
                  onClick={() => {
                    toast.loading("Analizăm CV-urile...");
                    setTimeout(() => {
                      toast.dismiss();
                      toast.success("Analiza a fost efectuată cu succes!");
                      localStorage.setItem(
                        "cvAnalysisResults",
                        JSON.stringify(filteredCVs)
                      );
                    }, 2000);
                  }}
                >
                  Trimite la analiză
                </button>
              )}
            </div>

            <div className="uploaded-list">
              {filteredCVs.length === 0 ? (
                <div className="no-cv">
                  <img src={FileIcon} alt="no files" />
                  <p>Nu există CV-uri încărcate pentru acest job.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nume fișier</th>
                      <th>Dimensiune</th>
                      <th>Data încărcării</th>
                      <th>Acțiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCVs.map((cv) => (
                      <tr key={cv.id}>
                        <td>{cv.fileName}</td>
                        <td>{cv.fileSize}</td>
                        <td>{cv.uploadDate}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(cv.id)}
                          >
                            <img src={Trash} alt="delete" />
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
    </DashboardLayout>
  );
};

export default UploadCVPage;
