import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./CVDetailsPage.module.css";
import { PATHS } from "../../routs/paths";

import { cvsApi, type Cv } from "../../api/cvs.service";

import {
  FaChevronLeft,
  FaMagic,
  FaFileSignature,
  FaFingerprint,
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
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const ChevronLeft = FaChevronLeft as unknown as ComponentType<IconBaseProps>;
const MagicIcon = FaMagic as unknown as ComponentType<IconBaseProps>;
const FileSignature =
  FaFileSignature as unknown as ComponentType<IconBaseProps>;
const Fingerprint = FaFingerprint as unknown as ComponentType<IconBaseProps>;
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

type LocationState = {
  fromResults?: boolean;
  jobId?: number;
};

type ExperienceItem = {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
  technologies?: string[];
};

type EducationItem = {
  school?: string;
  degree?: string;
  field?: string;
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

  const match = cv?.matchScore ?? 0;

  const scoreLabel = useMemo(() => {
    if (match >= 85) return "Potrivire foarte bună";
    if (match >= 65) return "Potrivire bună";
    if (match > 0) return "Potrivire scăzută";
    return "Neanalizat încă";
  }, [match]);

  const uploadDateText = useMemo(() => {
    const raw = (cv as any)?.uploadDate ?? (cv as any)?.createdAt ?? null;
    if (!raw) return "—";
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? String(raw)
      : d.toLocaleDateString("ro-RO");
  }, [cv]);

  const pdfUrl = useMemo(() => (cv ? cvsApi.getPdfUrl(cv) : null), [cv]);

  const analysis = useMemo(() => {
    const raw = (cv as any)?.analysisRaw;
    if (raw && typeof raw === "object") return raw as any;
    return null;
  }, [cv]);

  const email: string | null = (cv as any)?.email ?? analysis?.email ?? null;
  const phone: string | null = (cv as any)?.phone ?? analysis?.phone ?? null;

  const languages: string[] = (cv as any)?.languages?.length
    ? (cv as any).languages
    : analysis?.languages || [];

  const domains: string[] = (cv as any)?.domains?.length
    ? (cv as any).domains
    : analysis?.domains || [];

  const experience = (analysis?.experience ?? []) as ExperienceItem[];
  const education = (analysis?.education ?? []) as EducationItem[];

  const recommendationUi = useMemo(() => {
    const rec = String(analysis?.recommendation || "").toUpperCase();
    if (rec === "INVITA")
      return { label: "Invită la interviu", tone: "ok" as const };
    if (rec === "RESPINGE") return { label: "Respinge", tone: "warn" as const };
    return { label: "Revizuire manuală", tone: "neutral" as const };
  }, [analysis]);

  const reasoningShort = useMemo(() => {
    const s = analysis?.reasoningShort;
    return typeof s === "string" && s.trim().length ? s.trim() : null;
  }, [analysis]);

  const analysisSummary = useMemo(() => {
    if ((cv as any)?.analysisSummary?.trim())
      return (cv as any).analysisSummary.trim();
    if (analysis && typeof (analysis as any).summary === "string")
      return String((analysis as any).summary).trim();
    return null;
  }, [cv, analysis]);

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

  const onAnalyzeNow = async () => {
    if (!cv) return;

    try {
      toast.loading("Rulez analiza...", { id: "analyze" });
      const updated = await cvsApi.analyze((cv as any).id);
      setCv(updated);
      toast.success("Analiza a fost salvată!", { id: "analyze" });
    } catch {
      toast.error("Analiza a eșuat", { id: "analyze" });
    }
  };

  const safeFileName: string = (cv as any)?.fileName ?? "—";
  const safeCandidateName: string = (cv as any)?.candidateName?.trim?.()
    ? (cv as any).candidateName
    : "Nume indisponibil";

  const allSkills: string[] = ((cv as any)?.skills ?? []).filter(Boolean);
  const MAX_SKILLS = 10;

  const [skillsExpanded, setSkillsExpanded] = useState(false);

  const visibleSkills = useMemo(() => {
    if (skillsExpanded) return allSkills;
    return allSkills.slice(0, MAX_SKILLS);
  }, [allSkills, skillsExpanded]);

  const hiddenCount = Math.max(0, allSkills.length - MAX_SKILLS);

  const buildGmailComposeUrl = (to: string, subject: string, body: string) => {
    const params = new URLSearchParams();
    params.set("view", "cm");
    params.set("fs", "1");
    params.set("tf", "1");
    params.set("to", to);
    params.set("su", subject);
    params.set("body", body);

    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  const onEmailCandidate = () => {
    const to = String(email || "").trim();
    if (!to) {
      toast.error("Nu există email detectat pentru candidat.");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
    if (!isValidEmail) {
      toast.error("Email-ul detectat pare invalid.");
      return;
    }

    const candidateSafe = String(safeCandidateName || "").trim() || "Candidat";

    const jobTitleSafe = String((location.state as any)?.jobTitle || "").trim();
    const jobPart = jobTitleSafe ? ` – ${jobTitleSafe}` : "";
    const signatureSafe = "Compania mea";

    const rec = String(analysis?.recommendation || "").toUpperCase(); // "INVITA" | "RESPINGE" | altceva

    let subject = "";
    let body = "";

    if (rec === "INVITA") {
      subject = `Invitație la interviu${jobPart}`;

      body = `Bună, ${candidateSafe},

Îți mulțumim pentru aplicația transmisă${jobTitleSafe ? ` pentru poziția de ${jobTitleSafe}` : ""}.
În urma evaluării, dorim să continuăm procesul de recrutare și să te invităm la un interviu.

Te rugăm să ne confirmi disponibilitatea ta în următoarele zile și intervale, sau să propui alternative:
• [Ziua / intervalul 1]
• [Ziua / intervalul 2]
• [Ziua / intervalul 3]

Detalii:
• Format: [online / la sediu]
• Durată estimată: [30–45 min]
• Persoană de contact: [Nume / rol]

Cu stimă,
${signatureSafe}
`;
    } else if (rec === "RESPINGE") {
      subject = `Actualizare privind aplicația${jobPart}`;

      body = `Bună, ${candidateSafe},

Îți mulțumim pentru interesul acordat${jobTitleSafe ? ` poziției de ${jobTitleSafe}` : ""} și pentru timpul investit.
În urma evaluării aplicației, am decis să continuăm procesul de selecție cu alți candidați, ale căror profiluri se potrivesc mai bine cerințelor curente.

Apreciem implicarea ta și îți dorim mult succes în demersurile profesionale viitoare.
Dacă dorești, putem păstra datele tale în baza noastră pentru oportunități viitoare.

Cu stimă,
${signatureSafe}
`;
    } else {
      subject = `Clarificări privind aplicația${jobPart}`;

      body = `Bună, ${candidateSafe},

Îți mulțumim pentru aplicația transmisă${jobTitleSafe ? ` pentru poziția de ${jobTitleSafe}` : ""}.
Pentru a finaliza evaluarea, am avea nevoie de câteva clarificări:

1) [Întrebare / detaliu necesar]
2) [Întrebare / detaliu necesar]
3) [Întrebare / detaliu necesar]

Te rugăm să ne răspunzi la acest email cu informațiile de mai sus, iar apoi revenim cu pașii următori.

Cu stimă,
${signatureSafe}
`;
    }

    const url = buildGmailComposeUrl(to, subject, body);

    window.location.href = url;
  };

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

            <div className={styles.profileBadge}>
              <div className={styles.badgeIcon}>
                <Fingerprint />
              </div>
              <div className={styles.badgeText}>
                <span className={styles.badgeLabel}>ID CANDIDAT</span>
                <span className={styles.badgeValue}>#{cvId || "000"}</span>
              </div>
            </div>
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
                  {(cv as any)?.status || "Inactiv"}
                </div>
                <div className={styles.dotSeparator} />
                <span className={styles.dateInfo}>
                  Actualizat: {uploadDateText}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.actionGroup}>
              <button
                type="button"
                className={styles.magicBtn}
                onClick={onAnalyzeNow}
                disabled={!cv || loading}
              >
                <div className={styles.magicGlow} />
                <MagicIcon className={styles.magicIcon} />
                <span>Re-analizează</span>
              </button>
            </div>
          </div>
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

                <button
                  type="button"
                  className={[
                    styles.decisionArtefact,
                    recommendationUi.tone === "ok"
                      ? styles.artefactOk
                      : recommendationUi.tone === "warn"
                        ? styles.artefactWarn
                        : styles.artefactNeutral,
                  ].join(" ")}
                  onClick={onEmailCandidate}
                  disabled={!email}
                  title={
                    !email
                      ? "Nu există email detectat"
                      : "Deschide email precompletat"
                  }
                >
                  {recommendationUi.tone === "ok" ? (
                    <MagicIcon className={styles.artefactIcon} />
                  ) : (
                    <Fingerprint className={styles.artefactIcon} />
                  )}
                  <span className={styles.artefactLabel}>
                    {recommendationUi.label}
                  </span>
                </button>
              </aside>

              <div className={styles.rightColumn}>
                <section
                  className={`${styles.card} ${styles.identityEliteCard}`}
                >
                  <div className={styles.identityPrimaryLayout}>
                    {/* Avatar Section with Ethereal Aura */}
                    <div className={styles.avatarAuraContainer}>
                      <div className={styles.avatarAuraBreathing} />
                      <div className={styles.avatarGlassElement}>
                        {safeCandidateName[0]}
                      </div>
                    </div>

                    {/* Identity Text Content */}
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
                      </div>
                    </div>
                  </div>

                  <div className={styles.horizontalStructuralDivider} />

                  {/* Tags Section with Subtle Lighting */}
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

                <section className={styles.card}>
                  <div className={styles.sectionHeaderWow}>
                    <Briefcase className={styles.headerIconWow} />
                    <div>
                      <h3>Parcurs Profesional</h3>
                    </div>
                  </div>

                  {experience.length ? (
                    <div className={styles.timelineWow}>
                      {experience.map((e: ExperienceItem, idx: number) => (
                        <div key={idx} className={styles.timelineItemWow}>
                          <div className={styles.timelineLine} />
                          <div className={styles.timelineDotWow} />
                          <div className={styles.timelineContentWow}>
                            <div className={styles.timelineTopWow}>
                              <h4>{e.title || "Rol Profesional"}</h4>
                              <span className={styles.timelineDate}>
                                {e.startDate}{" "}
                                {e.endDate ? `- ${e.endDate}` : "- Prezent"}
                              </span>
                            </div>
                            <p className={styles.companyWow}>
                              {e.company} • {e.location}
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
                      {education.map((ed: EducationItem, i: number) => (
                        <div key={i} className={styles.educationItem}>
                          <strong className={styles.educationSchool}>
                            {ed.school || "Instituție"}
                          </strong>
                          <p className={styles.educationMeta}>
                            {ed.degree || ""} {ed.field || ""}
                          </p>
                        </div>
                      ))}
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

                        {hiddenCount > 0 ? (
                          <button
                            type="button"
                            className={styles.inlineToggleBtn}
                            onClick={() => setSkillsExpanded((v) => !v)}
                          >
                            {skillsExpanded
                              ? "Restrânge"
                              : `Afișează toate (+${hiddenCount})`}
                          </button>
                        ) : null}
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

                    {reasoningShort ? (
                      <div className={styles.reasoningContainerWow}>
                        <div className={styles.reasoningLabel}>
                          LOGICA DECIZIEI
                        </div>
                        <code className={styles.reasoningCode}>
                          {reasoningShort}
                        </code>
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>

            <section className={styles.pdfCard}>
              <div className={styles.pdfHeader}>
                <h2 className={styles.pdfTitle}>Document PDF</h2>
                <span className={styles.helperPill}>Preview</span>
              </div>

              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className={styles.pdfViewer}
                  title="PDF Viewer"
                />
              ) : (
                <div className={styles.pdfFallback}>
                  PDF indisponibil. CV-ul nu are fișier asociat (filePath
                  lipsă).
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CVDetailsPage;
