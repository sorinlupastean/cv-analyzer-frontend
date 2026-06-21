import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./CVDetailsPage.module.css";
import { PATHS } from "../../routs/paths";
import EmailCandidateModal from "../../components/EmailCandidateModal/EmailCandidateModal";

import {
  cvsApi,
  type Cv,
  type FinalCandidateAnalysis,
  type CandidateExperience,
  type CandidateEducation,
} from "../../api/cvs.service";

import {
  FaChevronLeft,
  FaFileSignature,
  FaChartLine,
  FaEnvelope,
  FaPhoneAlt,
  FaGlobeEurope,
  FaLanguage,
  FaBriefcase,
  FaGraduationCap,
  FaAward,
  FaRobot,
  FaFilePdf,
  FaCalendar,
  FaGithub,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const ChevronLeft = FaChevronLeft as unknown as ComponentType<IconBaseProps>;
const FileSignature =
  FaFileSignature as unknown as ComponentType<IconBaseProps>;
const ChartLine = FaChartLine as unknown as ComponentType<IconBaseProps>;
const Envelope = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const PhoneAlt = FaPhoneAlt as unknown as ComponentType<IconBaseProps>;
const GlobeEurope = FaGlobeEurope as unknown as ComponentType<IconBaseProps>;
const LanguageIcon = FaLanguage as unknown as ComponentType<IconBaseProps>;
const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const GraduationCap =
  FaGraduationCap as unknown as ComponentType<IconBaseProps>;
const Award = FaAward as unknown as ComponentType<IconBaseProps>;
const RobotIcon = FaRobot as unknown as ComponentType<IconBaseProps>;
const FilePdf = FaFilePdf as unknown as ComponentType<IconBaseProps>;
const CalendarIcon = FaCalendar as unknown as ComponentType<IconBaseProps>;
const GithubIcon = FaGithub as unknown as ComponentType<IconBaseProps>;

const MONTH_ALIASES: Record<string, string> = {
  january: "ianuarie",
  jan: "ianuarie",
  february: "februarie",
  feb: "februarie",
  march: "martie",
  mar: "martie",
  april: "aprilie",
  apr: "aprilie",
  may: "mai",
  june: "iunie",
  jun: "iunie",
  july: "iulie",
  jul: "iulie",
  august: "august",
  sep: "septembrie",
  september: "septembrie",
  oct: "octombrie",
  october: "octombrie",
  nov: "noiembrie",
  november: "noiembrie",
  dec: "decembrie",
  december: "decembrie",
  ianuarie: "ianuarie",
  februarie: "februarie",
  martie: "martie",
  aprilie: "aprilie",
  mai: "mai",
  iunie: "iunie",
  iulie: "iulie",
  septembrie: "septembrie",
  octombrie: "octombrie",
  noiembrie: "noiembrie",
  decembrie: "decembrie",
};

const capitalizeRo = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const normalizeDateLabel = (input?: string | null): string => {
  const raw = String(input ?? "").trim();
  if (!raw) return "?";

  const lower = raw.toLowerCase();
  if (lower === "present" || lower === "prezent") return "Prezent";

  const monthYear = raw.match(
    /^(?:(\d{4})[-/. ](?:(\d{1,2}))|([a-zA-ZăâîșțĂÂÎȘȚ]+)\s+(\d{4})|(\d{1,2})\s+([a-zA-ZăâîșțĂÂÎȘȚ]+)\s+(\d{4}))$/,
  );

  if (monthYear) {
    const year = monthYear[1] || monthYear[4] || monthYear[7];
    const monthPart = monthYear[2] || monthYear[3] || monthYear[6];

    if (year && monthPart) {
      const monthNumber = /^\d{1,2}$/.test(monthPart)
        ? Number(monthPart)
        : null;

      let monthName = "";
      if (monthNumber && monthNumber >= 1 && monthNumber <= 12) {
        const d = new Date(Date.UTC(Number(year), monthNumber - 1, 1));
        monthName = new Intl.DateTimeFormat("ro-RO", {
          month: "long",
          timeZone: "UTC",
        }).format(d);
      } else {
        monthName = MONTH_ALIASES[monthPart.toLowerCase()] || monthPart;
      }

      return capitalizeRo(`${monthName} ${year}`);
    }
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return capitalizeRo(
      new Intl.DateTimeFormat("ro-RO", {
        month: "long",
        year: "numeric",
      }).format(parsed),
    );
  }

  const mapped = MONTH_ALIASES[lower];
  if (mapped) return capitalizeRo(mapped);

  return raw;
};

const formatExperiencePeriod = (entry: CandidateExperience): string => {
  const start = normalizeDateLabel(entry.startDate);
  const endRaw = String(entry.endDate ?? "").trim();
  const end = normalizeDateLabel(entry.endDate);

  if (!entry.endDate || endRaw.length === 0) {
    return start;
  }

  if (end === "Prezent") {
    return `${start} - Prezent`;
  }

  if (end === start) {
    return start;
  }

  return `${start} - ${end}`;
};

type LocationState = {
  fromResults?: boolean;
  jobId?: number;
  jobTitle?: string;
};

type EmailDraft = {
  to: string;
  subject: string;
  body: string;
};

const CVDetailsPage: React.FC = () => {
  const { id } = useParams();
  const cvId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    to: "",
    subject: "",
    body: "",
  });

  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Fetch CV data
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
      } catch {
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

  const analysis = useMemo<FinalCandidateAnalysis | null>(() => {
    const raw = cv?.analysisRaw;
    if (raw && typeof raw === "object") return raw;
    return null;
  }, [cv]);

  const match = analysis?.finalScore ?? cv?.matchScore ?? 0;
  const githubAnalysis = analysis?.githubAnalysis ?? null;
  const headerStatusLabel = analysis ? "Analizat" : "Încărcat";

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

  const fileUrl = useMemo(() => (cv ? cvsApi.getFileUrl(cv) : null), [cv]);

  const isPdf = useMemo(() => {
    const mt = String(cv?.mimeType || "").toLowerCase();
    if (mt === "application/pdf") return true;
    const name = String(cv?.fileName || "").toLowerCase();
    return name.endsWith(".pdf");
  }, [cv]);

  // Fetch PDF as blob to bypass Content-Disposition: attachment
  useEffect(() => {
    if (!fileUrl || !isPdf) return;

    let objectUrl: string | null = null;

    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(fileUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        setBlobUrl(null);
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl, isPdf]);

  const email: string | null = cv?.email ?? analysis?.email ?? null;
  const phone: string | null = cv?.phone ?? analysis?.phone ?? null;

  const languages: string[] = cv?.languages?.length
    ? cv.languages
    : analysis?.languages || [];

  const domains: string[] = cv?.domains?.length
    ? cv.domains
    : analysis?.domains || [];

  const experience: CandidateExperience[] =
    analysis?.cvAnalysis?.experience ?? [];
  const education: CandidateEducation[] = analysis?.cvAnalysis?.education ?? [];

  const recommendationUi = useMemo(() => {
    const rec = String(analysis?.recommendation || "").toUpperCase();
    if (rec === "INVITA") {
      return { label: "Invită la interviu", tone: "ok" as const };
    }
    if (rec === "RESPINGE") {
      return { label: "Respinge", tone: "warn" as const };
    }
    return { label: "Revizuire manuală", tone: "neutral" as const };
  }, [analysis]);

  const reasoningShort = useMemo(() => {
    const s = analysis?.reasoningShort;
    return typeof s === "string" && s.trim().length ? s.trim() : null;
  }, [analysis]);

  const analysisSummary = useMemo(() => {
    if (cv?.analysisSummary?.trim()) return cv.analysisSummary.trim();
    if (analysis?.summary?.trim()) return analysis.summary.trim();
    return null;
  }, [cv, analysis]);

  const matchedRequirements = analysis?.matchedRequirements ?? [];
  const missingRequirements = analysis?.missingRequirements ?? [];
  const redFlags = analysis?.redFlags ?? [];
  const evidence = analysis?.evidence ?? [];

  const onBack = () => {
    const state = (location.state ?? {}) as LocationState;

    if (state.fromResults && state.jobId) {
      navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.CREATE_JOB}`, {
        state: { openJobId: state.jobId },
        replace: true,
      });
      return;
    }

    navigate(-1);
  };

  const safeFileName: string = cv?.fileName ?? "—";
  const safeCandidateName: string = cv?.candidateName?.trim?.()
    ? cv.candidateName
    : "Nume indisponibil";

  const candidatePhotoSrc = useMemo(() => {
    const raw =
      analysis?.candidatePhotoDataUrl ||
      analysis?.cvAnalysis?.candidatePhotoDataUrl ||
      null;

    if (typeof raw !== "string") return null;

    const trimmed = raw.trim();
    if (!trimmed) return null;

    if (
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return null;
  }, [analysis]);

  const candidateInitial = safeCandidateName.trim().charAt(0).toUpperCase() || "G";

  const allSkills: string[] = (cv?.skills ?? analysis?.skills ?? []).filter(
    Boolean,
  );
  const MAX_SKILLS = 10;

  const visibleSkills = useMemo(() => {
    if (skillsExpanded) return allSkills;
    return allSkills.slice(0, MAX_SKILLS);
  }, [allSkills, skillsExpanded]);

  const hiddenCount = Math.max(0, allSkills.length - MAX_SKILLS);

  const buildEmailDraft = () => {
    const to = String(email || "").trim();
    const candidateSafe = String(safeCandidateName || "").trim() || "Candidat";
    const jobTitleSafe = String(
      ((location.state as LocationState) || {}).jobTitle || "",
    ).trim();
    const jobPart = jobTitleSafe ? ` - ${jobTitleSafe}` : "";
    const signatureSafe = "Compania mea";
    const rec = String(analysis?.recommendation || "").toUpperCase();

    let subject = "";
    let body = "";

    if (rec === "INVITA") {
      subject = `Invitație la interviu${jobPart}`;
      body = `Bună, ${candidateSafe},

Îți mulțumim pentru aplicația transmisă${jobTitleSafe ? ` pentru poziția de ${jobTitleSafe}` : ""}.
Dorim să continuăm procesul și să te invităm la un interviu.

Te rugăm să confirmi disponibilitatea ta:
• [Ziua / intervalul 1]
• [Ziua / intervalul 2]
• [Ziua / intervalul 3]

Detalii:
• Format: [online / la sediu]
• Durată: [30–45 min]
• Persoană de contact: [Nume / rol]

Cu stimă,
${signatureSafe}
`;
    } else if (rec === "RESPINGE") {
      subject = `Actualizare privind aplicația${jobPart}`;
      body = `Bună, ${candidateSafe},

Îți mulțumim pentru interes și pentru timpul investit.
În urma evaluării, vom continua cu alți candidați ale căror profiluri se potrivesc mai bine cerințelor curente.

Îți dorim mult succes în continuare.
Cu stimă,
${signatureSafe}
`;
    } else {
      subject = `Clarificări privind aplicația${jobPart}`;
      body = `Bună, ${candidateSafe},

Îți mulțumim pentru aplicație${jobTitleSafe ? ` pentru poziția de ${jobTitleSafe}` : ""}.
Pentru a finaliza evaluarea, avem nevoie de câteva clarificări:

1) [Întrebare]
2) [Întrebare]
3) [Întrebare]

Mulțumim,
${signatureSafe}
`;
    }

    return { to, subject, body };
  };

  const onEmailCandidate = () => {
    const to = String(email || "").trim();
    if (!to) {
      toast.error("Nu există email detectat pentru candidat.");
      return;
    }

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
    if (!valid) {
      toast.error("Email-ul detectat pare invalid.");
      return;
    }

    setEmailDraft(buildEmailDraft());
    setIsEmailModalOpen(true);
  };

  const sendEmailNow = async (e: React.FormEvent) => {
    e.preventDefault();

    const to = emailDraft.to.trim();
    const subject = emailDraft.subject.trim();
    const body = emailDraft.body.trim();

    if (!to || !subject || !body) {
      toast.error("Completează To, Subiect și Mesaj.");
      return;
    }

    try {
      toast.loading("Trimit email...", { id: "sendMail" });
      await cvsApi.sendEmail(cvId, { to, subject, text: body });
      toast.success("Email trimis!", { id: "sendMail" });
      setIsEmailModalOpen(false);
    } catch {
      toast.error("Nu am putut trimite email.", { id: "sendMail" });
    }
  };

  // Tone class — acoperă toate cele 3 cazuri posibile
  const emailArtefactClass = [
    styles.emailArtefact,
    recommendationUi.tone === "ok"
      ? styles.toneOk
      : recommendationUi.tone === "warn"
        ? styles.toneWarn
        : styles.toneNeutral,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
              <ChevronLeft className={styles.iconNav} />
              <span>Înapoi</span>
            </button>

            <div className={styles.verticalSeparator} />
          </div>

          <div className={styles.topBarCenter}>
            <div className={styles.glassHeader}>
              <div className={styles.headerTitleGroup}>
                <FileSignature className={styles.titleIcon} />
                <h1 className={styles.pageTitle}>Dosar Candidat</h1>
              </div>

              <div className={styles.headerStatusRow}>
                <div className={styles.statusIndicator}>
                  <span className={styles.pulseDot} />
                  {headerStatusLabel}
                </div>
                <div className={styles.dotSeparator} />
                <span className={styles.dateInfo}>
                  Actualizat: {uploadDateText}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.topBarRight} />
        </header>

        {loading ? (
          <div className={styles.stateWrap}>
            <div className={styles.stateCard}>Se încarcă...</div>
          </div>
        ) : !cv ? (
          <div className={styles.stateWrap}>
            <div className={styles.stateCard}>
              CV inexistent sau nu poate fi încărcat.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              <aside className={styles.leftColumn}>
                {/* Specificații fișier */}
                <section className={styles.fileMetadataArtefact}>
                  <div className={styles.artefactHeader}>
                    <FileSignature className={styles.headerIcon} />
                    <h3 className={styles.artefactSmallTitle}>
                      Specificații Fișier
                    </h3>
                  </div>

                  <div className={styles.metadataCloud}>
                    <div className={styles.metaRowWow}>
                      <div className={styles.metaIconWrap}>
                        <FilePdf />
                      </div>
                      <div className={styles.metaTextGroup}>
                        <span className={styles.metaLabel}>
                          Denumire document:
                        </span>
                        <span className={styles.metaValue} title={safeFileName}>
                          {safeFileName}
                        </span>
                      </div>
                    </div>

                    <div className={styles.metaRowWow}>
                      <div className={styles.metaIconWrap}>
                        <CalendarIcon />
                      </div>
                      <div className={styles.metaTextGroup}>
                        <span className={styles.metaLabel}>
                          Document indexat la:
                        </span>
                        <span className={styles.metaValue}>
                          {uploadDateText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.divineGlowInternal} />
                </section>

                {/* Scor analitic */}
                <section className={styles.glassScoreCard}>
                  <div className={styles.scoreHeader}>
                    <ChartLine className={styles.scoreIconHeader} />
                    <h3>Scor Analitic</h3>
                  </div>

                  <div className={styles.visualScore}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                      <path
                        className={styles.circleBg}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={styles.circle}
                        strokeDasharray={`${match}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className={styles.percentageText}>
                      <strong>{match}%</strong>
                    </div>
                  </div>

                  <div className={styles.scoreInfo}>
                    <div className={styles.labelStatus}>
                      <span className={styles.dotPulse} />
                      {scoreLabel}
                    </div>

                    <p className={styles.scoreDesc}>
                      Potrivire calculată pe baza algoritmului Studio AI.
                    </p>
                  </div>
                </section>

                {/* Email candidat */}
                <button
                  type="button"
                  className={emailArtefactClass}
                  onClick={onEmailCandidate}
                  disabled={!email}
                >
                  <div className={styles.divineGlow} />

                  <div className={styles.contentWrapper}>
                    <div className={styles.iconCircle}>
                      <Envelope className={styles.mainIcon} size={16} />
                    </div>

                    <div className={styles.textSection}>
                      <h3 className={styles.mainTitle}>Email Candidat</h3>
                      <span className={styles.emailAddress}>
                        {email || "Indisponibil"}
                      </span>
                    </div>

                    <div className={styles.statusBadge}>
                      {recommendationUi.label}
                    </div>
                  </div>

                  <div className={styles.shimmer} />
                </button>
              </aside>

              <div className={styles.rightColumn}>
                {/* Identitate candidat */}
                <section
                  className={`${styles.card} ${styles.identityEliteCard}`}
                >
                  <div className={styles.identityPrimaryLayout}>
                    <div className={styles.avatarAuraContainer}>
                      <div className={styles.avatarAuraBreathing} />
                      <div className={styles.avatarGlassElement}>
                        {candidatePhotoSrc ? (
                          <img
                            src={candidatePhotoSrc}
                            alt={safeCandidateName}
                            className={styles.avatarPhoto}
                          />
                        ) : (
                          <span>{candidateInitial}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.identityInfoContent}>
                      <div className={styles.nameHeaderGroup}>
                        <h2 className={styles.candidateNameDisplay}>
                          {safeCandidateName}
                        </h2>
                      </div>

                      <div className={styles.contactInformationGrid}>
                        <div className={styles.contactGlassChip}>
                          <div className={styles.chipIconContainer}>
                            <Envelope />
                          </div>
                          <span className={styles.chipDataText}>
                            {email || "email indisponibil"}
                          </span>
                        </div>

                        <div className={styles.contactGlassChip}>
                          <div className={styles.chipIconContainer}>
                            <PhoneAlt />
                          </div>
                          <span className={styles.chipDataText}>
                            {phone || "telefon indisponibil"}
                          </span>
                        </div>

                        {githubAnalysis?.profileUrl && (
                          <div className={styles.contactGlassChip}>
                            <div className={styles.chipIconContainer}>
                              <GithubIcon />
                            </div>
                            <a
                              href={githubAnalysis.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.chipDataText}
                            >
                              {githubAnalysis.username}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.horizontalStructuralDivider} />

                  <div className={styles.expertiseTagsContainer}>
                    {domains.map((d: string) => (
                      <span key={d} className={styles.domainEliteTag}>
                        <GlobeEurope /> {d}
                      </span>
                    ))}
                    {languages.map((l: string) => (
                      <span key={l} className={styles.languageEliteTag}>
                        <LanguageIcon /> {l}
                      </span>
                    ))}
                  </div>

                  <div className={styles.divineAtmosphericRay} />
                </section>

                {/* Parcurs profesional */}
                <section className={styles.card}>
                  <div className={styles.sectionHeaderWow}>
                    <Briefcase className={styles.headerIconWow} />
                    <div>
                      <h3>Parcurs Profesional</h3>
                    </div>
                  </div>

                  {experience.length ? (
                    <div className={styles.timelineWow}>
                      {experience.map((e: CandidateExperience, idx: number) => (
                        <div key={idx} className={styles.timelineItemWow}>
                          <div className={styles.timelineLine} />
                          <div className={styles.timelineDotWow} />
                          <div className={styles.timelineContentWow}>
                            <div className={styles.timelineTopWow}>
                              <h4>{e.title || "Rol Profesional"}</h4>
                              <span className={styles.timelineDate}>
                                {formatExperiencePeriod(e)}
                              </span>
                            </div>

                            <p className={styles.companyWow}>
                              {e.company || "Companie"}{" "}
                              {e.location ? `• ${e.location}` : ""}
                            </p>

                            {e.responsibilities?.length ? (
                              <ul className={styles.responsibilitiesWow}>
                                {e.responsibilities
                                  .slice(0, 4)
                                  .map((r: string, i: number) => (
                                    <li key={i}>- {r}</li>
                                  ))}
                              </ul>
                            ) : null}

                            {e.technologies?.length ? (
                              <div className={styles.techPillsWow}>
                                {e.technologies.slice(0, 8).map((t: string) => (
                                  <span key={t}>{t}</span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyInlineWow}>
                      Nicio experiență detectată.
                    </div>
                  )}
                </section>

                {/* Educatie + Skill-uri */}
                <div className={styles.twoColGrid}>
                  <section
                    className={`${styles.card} ${styles.simplePanelCard}`}
                  >
                    <div className={styles.sectionHeaderClean}>
                      <div className={styles.headerIconChip}>
                        <GraduationCap className={styles.headerIconClean} />
                      </div>
                      <h3 className={styles.sectionTitleClean}>Educație</h3>
                    </div>

                    <div className={styles.educationList}>
                      {education.length ? (
                        education.map((ed: CandidateEducation, i: number) => (
                          <div key={i} className={styles.educationItem}>
                            <strong className={styles.educationSchool}>
                              {ed.school || "Instituție"}
                            </strong>
                            <p className={styles.educationMeta}>
                              {ed.degree || ""} {ed.field || ""}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyInline}>
                          Nu există informații despre educație.
                        </div>
                      )}
                    </div>
                  </section>

                  <section
                    className={`${styles.card} ${styles.simplePanelCard}`}
                  >
                    <div className={styles.sectionHeaderClean}>
                      <div className={styles.headerIconChip}>
                        <Award className={styles.headerIconClean} />
                      </div>

                      <div className={styles.headerTitleRowClean}>
                        <h3 className={styles.sectionTitleClean}>
                          Skill-uri Cheie
                        </h3>

                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            className={styles.inlineToggleBtn}
                            onClick={() => setSkillsExpanded((v) => !v)}
                          >
                            {skillsExpanded
                              ? "Restrânge"
                              : `Afișează toate (+${hiddenCount})`}
                          </button>
                        )}
                      </div>
                    </div>

                    {visibleSkills.length ? (
                      <div className={styles.skillsCloud}>
                        {visibleSkills.map((s: string) => (
                          <span key={s} className={styles.skillPill} title={s}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyInline}>
                        Nu sunt skill-uri detectate.
                      </div>
                    )}
                  </section>
                </div>

                {/* GitHub Analysis — afișat doar dacă există și a fost folosit */}
                {githubAnalysis && githubAnalysis.usedInScoring && (
                  <section
                    className={`${styles.card} ${styles.simplePanelCard}`}
                  >
                    <div className={styles.sectionHeaderClean}>
                      <div className={styles.headerIconChip}>
                        <GithubIcon className={styles.headerIconClean} />
                      </div>
                      <div>
                        <h3 className={styles.sectionTitleClean}>
                          Analiză GitHub
                        </h3>
                        <p className={styles.sectionSubtitleClean}>
                          {githubAnalysis.analyzedReposCount} repository-uri
                          analizate · scor {githubAnalysis.githubScore}%
                        </p>
                      </div>
                    </div>

                    {githubAnalysis.validatedSkills.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p
                          className={styles.metaLabel}
                          style={{ marginBottom: 8 }}
                        >
                          Skill-uri validate prin cod:
                        </p>
                        <div className={styles.skillsCloud}>
                          {githubAnalysis.validatedSkills.map((s) => (
                            <span key={s} className={styles.skillPill}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {githubAnalysis.redFlags.length > 0 && (
                      <div>
                        <p
                          className={styles.metaLabel}
                          style={{ marginBottom: 8 }}
                        >
                          Observații:
                        </p>
                        <ul className={styles.evaluationList}>
                          {githubAnalysis.redFlags.map((flag) => (
                            <li
                              key={flag}
                              className={styles.evaluationListItemInfo}
                            >
                              <span className={styles.listBulletInfo} />
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* Raport AI */}
                <section className={`${styles.card} ${styles.aiReportCard}`}>
                  <div className={styles.aiReportHeader}>
                    <RobotIcon className={styles.aiRobotIcon} />
                    <div>
                      <h3>Raport de Evaluare AI</h3>
                      <p>Analiză semantică și logică a profilului</p>
                    </div>
                  </div>

                  <div className={styles.aiSummaryContent}>
                    <p className={styles.aiTextMain}>
                      {analysisSummary || "Nu există un rezumat generat."}
                    </p>

                    {reasoningShort && (
                      <div className={styles.reasoningContainerWow}>
                        <div className={styles.reasoningLabel}>
                          LOGICA DECIZIEI
                        </div>
                        <code className={styles.reasoningCode}>
                          {reasoningShort}
                        </code>
                      </div>
                    )}
                  </div>
                </section>

                {/* Evaluare detaliata */}
                <section className={`${styles.card} ${styles.evaluationCard}`}>
                  <div className={styles.sectionHeaderClean}>
                    <div className={styles.headerIconChip}>
                      <RobotIcon className={styles.headerIconClean} />
                    </div>
                    <div>
                      <h3 className={styles.sectionTitleClean}>
                        Evaluare detaliată
                      </h3>
                      <p className={styles.sectionSubtitleClean}>
                        Sinteză structurată a compatibilității candidatului cu
                        rolul
                      </p>
                    </div>
                  </div>

                  <div className={styles.evaluationGrid}>
                    <div
                      className={`${styles.evaluationPanel} ${styles.panelPositive}`}
                    >
                      <div className={styles.evaluationPanelHeader}>
                        <h4>Cerințe acoperite</h4>
                        <span className={styles.panelCount}>
                          {matchedRequirements.length}
                        </span>
                      </div>

                      {matchedRequirements.length ? (
                        <div className={styles.evaluationTags}>
                          {matchedRequirements.map((item) => (
                            <span key={item} className={styles.tagPositive}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyStateBox}>
                          Nu au fost identificate potriviri clare.
                        </div>
                      )}
                    </div>

                    <div
                      className={`${styles.evaluationPanel} ${styles.panelNeutral}`}
                    >
                      <div className={styles.evaluationPanelHeader}>
                        <h4>Cerințe lipsă</h4>
                        <span className={styles.panelCount}>
                          {missingRequirements.length}
                        </span>
                      </div>

                      {missingRequirements.length ? (
                        <div className={styles.evaluationTags}>
                          {missingRequirements.map((item) => (
                            <span key={item} className={styles.tagNeutral}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyStateBox}>
                          Nu au fost identificate lipsuri majore.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.evaluationGridSecondary}>
                    <div
                      className={`${styles.evaluationPanel} ${styles.panelWarning}`}
                    >
                      <div className={styles.evaluationPanelHeader}>
                        <h4>Semnale de risc</h4>
                        <span className={styles.panelCount}>
                          {redFlags.length}
                        </span>
                      </div>

                      {redFlags.length ? (
                        <ul className={styles.evaluationList}>
                          {redFlags.map((flag) => (
                            <li
                              key={flag}
                              className={styles.evaluationListItemWarning}
                            >
                              <span className={styles.listBulletWarning} />
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={styles.emptyStateBox}>
                          Nu au fost detectate semnale de risc.
                        </div>
                      )}
                    </div>

                    <div
                      className={`${styles.evaluationPanel} ${styles.panelInfo}`}
                    >
                      <div className={styles.evaluationPanelHeader}>
                        <h4>Dovezi identificate</h4>
                        <span className={styles.panelCount}>
                          {evidence.length}
                        </span>
                      </div>

                      {evidence.length ? (
                        <ul className={styles.evaluationList}>
                          {evidence.map((item) => (
                            <li
                              key={item}
                              className={styles.evaluationListItemInfo}
                            >
                              <span className={styles.listBulletInfo} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={styles.emptyStateBox}>
                          Nu există dovezi suplimentare extrase din analiză.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* PDF Viewer */}
            <section className={styles.pdfCard}>
              <div className={styles.pdfHeader}>
                <h2 className={styles.pdfTitle}>Document</h2>
                <span className={styles.helperPill}>
                  {isPdf ? "Previzualizare" : "Descărcare"}
                </span>
              </div>

              {!fileUrl ? (
                <div className={styles.pdfFallback}>
                  Document indisponibil. CV-ul nu are fișier asociat.
                </div>
              ) : isPdf ? (
                blobUrl ? (
                  <iframe
                    src={blobUrl}
                    className={styles.pdfViewer}
                    title="Vizualizator PDF"
                  />
                ) : (
                  <div className={styles.pdfFallback}>
                    Se încarcă documentul...
                  </div>
                )
              ) : (
                <div className={styles.pdfFallback}>
                  Preview indisponibil pentru acest format. Descarcă fișierul
                  pentru vizualizare.
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={fileUrl}
                      className={styles.downloadBtn}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Descarcă document
                    </a>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <EmailCandidateModal
        isOpen={isEmailModalOpen}
        draft={emailDraft}
        setDraft={setEmailDraft}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={sendEmailNow}
      />
    </div>
  );
};

export default CVDetailsPage;
