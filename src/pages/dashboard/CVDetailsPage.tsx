import React, { useEffect, useMemo, useState } from "react";
import styles from "./CVDetailsPage.module.css";

import UserIcon from "../../assets/user-animated.svg";
import EmailIcon from "../../assets/email.svg";
import PhoneIcon from "../../assets/phone.svg";
import Briefcase from "../../assets/briefcase.svg";
import SchoolIcon from "../../assets/school.svg";
import AwardIcon from "../../assets/award.svg";

import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { cvsApi, type Cv } from "../../api/cvs.service";

type LocationState = {
  fromResults?: boolean;
  jobId?: number;
};

const CVDetailsPage: React.FC = () => {
  const { id } = useParams();
  const cvId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cvId || Number.isNaN(cvId)) {
      toast.error("ID CV invalid");
      setLoading(false);
      setCv(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await cvsApi.getById(cvId);
        if (!cancelled) setCv(data);
      } catch (e: any) {
        if (!cancelled) {
          setCv(null);
          toast.error("Nu pot încărca detaliile CV-ului");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cvId]);

  const match = cv?.matchScore ?? 0;

  const scoreLabel = useMemo(() => {
    if (match >= 85) return "Potrivire foarte bună";
    if (match >= 65) return "Potrivire bună";
    if (match > 0) return "Potrivire scăzută";
    return "Neanalizat încă";
  }, [match]);

  const uploadDateText = useMemo(() => {
    const raw = cv?.uploadDate ?? cv?.createdAt ?? null;
    if (!raw) return "—";
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? String(raw)
      : d.toLocaleDateString("ro-RO");
  }, [cv]);

  const pdfUrl = useMemo(() => {
    if (!cv) return null;
    return cvsApi.getPdfUrl(cv);
  }, [cv]);

  const recommendation = useMemo(() => {
    if (!cv) return "Revizuire manuală";
    if (cv.status?.toLowerCase().includes("analizat") && cv.matchScore >= 75)
      return "Invită la interviu";
    if (cv.matchScore >= 85) return "Invită la interviu";
    if (cv.matchScore >= 60) return "Interviu tehnic scurt";
    return "Revizuire manuală";
  }, [cv]);

  const analysisSummary = useMemo(() => {
    // dacă salvezi rezumatul în cv.analysisSummary, îl arătăm
    if (cv?.analysisSummary?.trim()) return cv.analysisSummary.trim();

    // fallback dacă ai analysisRaw.summary
    const raw = cv?.analysisRaw;
    if (raw && typeof raw === "object" && typeof raw.summary === "string") {
      return raw.summary.trim();
    }

    return null;
  }, [cv]);

  const onBack = () => {
    const state = (location.state ?? {}) as LocationState;

    if (state.fromResults && state.jobId) {
      navigate("/dashboard/results", { state: { openJobId: state.jobId } });
      return;
    }

    navigate(-1);
  };

  const onAnalyzeNow = async () => {
    if (!cv) return;

    try {
      toast.loading("Rulez analiza...", { id: "analyze" });
      const updated = await cvsApi.analyze(cv.id);
      setCv(updated);
      toast.success("Analiza a fost salvată!", { id: "analyze" });
    } catch {
      toast.error("Analiza a eșuat", { id: "analyze" });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button className={styles.backButton} onClick={onBack}>
        Înapoi la rezultate
      </button>

      {loading ? (
        <div style={{ padding: 20 }}>Se încarcă...</div>
      ) : !cv ? (
        <div style={{ padding: 20 }}>
          CV inexistent sau nu poate fi încărcat.
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {/* LEFT CARD */}
            <div className={styles.leftCard}>
              <h2 className={styles.sectionTitle}>Scor potrivire</h2>

              <div className={styles.scoreNumber}>{match}%</div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(100, Math.max(0, match))}%` }}
                />
              </div>

              <p className={styles.scoreLabel}>{scoreLabel}</p>

              <hr className={styles.divider} />

              <h3 className={styles.subsectionTitle}>Informații fișier</h3>

              <div className={styles.infoRow}>
                <span>Nume fișier:</span>
                <strong>{cv.fileName}</strong>
              </div>

              <div className={styles.infoRow}>
                <span>Data upload:</span>
                <strong>{uploadDateText}</strong>
              </div>

              <div className={styles.infoRow}>
                <span>Status:</span>
                <span className={styles.statusBadge}>{cv.status}</span>
              </div>

              {/* buton optional: analizează acum */}
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={onAnalyzeNow}
                  className={styles.backButton}
                  style={{ marginBottom: 0 }}
                >
                  Rulează analiza acum
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className={styles.rightColumn}>
              {/* Informații candidat */}
              <div className={styles.infoCard}>
                <h2 className={styles.cardTitle}>
                  <img src={UserIcon} alt="" />
                  Informații candidat
                </h2>

                <p className={styles.name}>
                  {cv.candidateName?.trim()
                    ? cv.candidateName
                    : "Nume indisponibil"}
                </p>

                <div className={styles.detailRow}>
                  <img src={EmailIcon} alt="" />
                  email indisponibil
                </div>

                <div className={styles.detailRow}>
                  <img src={PhoneIcon} alt="" />
                  telefon indisponibil
                </div>
              </div>

              {/* Experiență */}
              <div className={styles.infoCard}>
                <h2 className={styles.cardTitle}>
                  <img src={Briefcase} alt="" />
                  Experiență profesională
                </h2>
                <p>Va fi completată după analiza CV-ului.</p>
              </div>

              {/* Educație */}
              <div className={styles.infoCard}>
                <h2 className={styles.cardTitle}>
                  <img src={SchoolIcon} alt="" />
                  Educație
                </h2>
                <p>Va fi completată după analiza CV-ului.</p>
              </div>

              {/* Skills */}
              <div className={styles.infoCard}>
                <h2 className={styles.cardTitle}>
                  <img src={AwardIcon} alt="" />
                  Competențe tehnice
                </h2>

                <div className={styles.skillsList}>
                  {cv.skills?.length ? (
                    cv.skills.map((s) => (
                      <span key={s} className={styles.skillTag}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#475472" }}>
                      Nicio competență extrasă încă.
                    </span>
                  )}
                </div>
              </div>

              {/* Analiză automată */}
              <div className={styles.analysisCard}>
                <h2 className={styles.analysisTitle}>Analiză automată</h2>

                {analysisSummary ? (
                  <p style={{ marginBottom: 12, color: "#475472" }}>
                    {analysisSummary}
                  </p>
                ) : (
                  <p style={{ marginBottom: 12, color: "#475472" }}>
                    Nu există încă un rezumat generat.
                  </p>
                )}

                <ul className={styles.checkList}>
                  <li>Status: {cv.status}</li>
                  <li>Scor: {cv.matchScore}%</li>
                  <li>
                    Skills: {cv.skills?.length ? cv.skills.join(", ") : "—"}
                  </li>
                  <li>Recomandare: {recommendation}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* PDF VIEWER */}
          <div className={styles.pdfWrapper}>
            <h2 className={styles.pdfTitle}>Document PDF</h2>

            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className={styles.pdfViewer}
                title="PDF Viewer"
              />
            ) : (
              <div style={{ padding: 12, color: "#475472" }}>
                PDF indisponibil. CV-ul nu are fișier asociat (filePath lipsă).
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CVDetailsPage;
