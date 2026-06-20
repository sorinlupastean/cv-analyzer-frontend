import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./RecruiterCopilotPage.module.css";
import { jobsApi, type CVResult, type Job, type RecruiterCopilotCandidate, type RecruiterCopilotReport } from "../../api/jobs.service";
import { normalizeUnicodeText } from "../../utils/text-normalization";

import {
  FaFileAlt,
  FaRobot,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChevronDown,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const FileIcon = FaFileAlt as unknown as ComponentType<IconBaseProps>;
const RobotIcon = FaRobot as unknown as ComponentType<IconBaseProps>;
const WarningIcon = FaExclamationTriangle as unknown as ComponentType<IconBaseProps>;
const RefreshIcon = FaSyncAlt as unknown as ComponentType<IconBaseProps>;
const ChevronDownIcon = FaChevronDown as unknown as ComponentType<IconBaseProps>;

type CandidateTab = "rezumat" | "dovezi" | "riscuri" | "intrebari";
type ActionState = Record<number, string>;
type LocationState = { jobId?: number; openJobId?: number };

const actionLabel: Record<string, string> = {
  INVITE: "Invită",
  REVIEW: "Revizuiește",
  REJECT: "Respinge",
  FOLLOW_UP: "Urmărire",
};

const decisionLabel = (value: string) => actionLabel[value] || "Urmărire";

const scoreTone = (score: number) => {
  if (score >= 85) return styles.scoreTop;
  if (score >= 70) return styles.scoreHigh;
  if (score >= 55) return styles.scoreMid;
  return styles.scoreLow;
};

const nextStepTone = (value: string) => {
  switch (value) {
    case "INVITE":
      return styles.toneInvite;
    case "REVIEW":
      return styles.toneReview;
    case "REJECT":
      return styles.toneReject;
    default:
      return styles.toneFollow;
  }
};

const clean = (value: unknown) => normalizeUnicodeText(String(value ?? ""));

const candidateCardSummary = (candidate: RecruiterCopilotCandidate) => {
  switch (candidate.nextStep) {
    case "INVITE":
      return "Are argumente solide pentru interviu.";
    case "REVIEW":
      return "Pare promițător, dar merită verificat încă o dată.";
    case "REJECT":
      return "Are prea multe lipsuri pentru a merge mai departe acum.";
    default:
      return "Are nevoie de clarificări suplimentare înainte de decizie.";
  }
};

const candidatePlainSummary = (candidate: RecruiterCopilotCandidate) => {
  const scoreLabel =
    candidate.matchScore >= 85
      ? "potrivire foarte bună"
      : candidate.matchScore >= 70
        ? "potrivire bună"
        : candidate.matchScore >= 55
          ? "potrivire medie"
          : "potrivire redusă";

  const stepLabel =
    candidate.nextStep === "INVITE"
      ? "recomandat pentru interviu"
      : candidate.nextStep === "REVIEW"
        ? "merită verificat mai atent"
      : candidate.nextStep === "REJECT"
        ? "nu este potrivit acum"
        : "are nevoie de clarificări";

  const evidenceCount = candidate.evidence.length;
  const riskCount = candidate.risks.length;
  const criteriaLine = `${evidenceCount} potriviri confirmate, ${riskCount} lipsuri notate`;
  const verdict =
    candidate.nextStep === "INVITE"
      ? "Candidat recomandat pentru interviu"
      : candidate.nextStep === "REVIEW"
        ? "Candidat promițător, dar necesită validare suplimentară"
        : candidate.nextStep === "REJECT"
          ? "Candidat nerecomandat pentru avansare"
          : "Candidat cu informații insuficiente pentru decizie";

  return {
    title: verdict,
    subtitle: `${candidate.candidateName} are ${candidate.matchScore}% potrivire și este încadrat ca ${scoreLabel}, ${stepLabel}.`,
    scoreLine: `Scor final: ${candidate.matchScore}%`,
    confidenceLine: `Încredere: ${candidate.confidenceScore}%`,
    recommendationLine: `Recomandare: ${decisionLabel(candidate.nextStep)}`,
    supportLine: `Susținut de ${evidenceCount} dovezi și ${riskCount} riscuri identificate`,
    criteriaLine: `Cerințe: ${criteriaLine}`,
    note: candidateCardSummary(candidate),
  };
};

const buildRequirementFocus = (requirements: string) => {
  const text = clean(requirements).replace(/\s+/g, " ").trim();
  if (!text) return [];

  const rawParts = text
    .split(/[\n•;]+|,\s*(?=[A-ZĂÂÎȘȚ0-9])/)
    .map((part) => part.trim().replace(/^\s*[-*]\s*/, ""))
    .filter(Boolean);

  const fallbackParts = text.split(/,|\//g).map((part) => part.trim()).filter(Boolean);
  const parts = (rawParts.length ? rawParts : fallbackParts)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length >= 3);

  const seen = new Set<string>();
  const focus: string[] = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    focus.push(part);
    if (focus.length === 3) break;
  }

  return focus;
};

const clamp = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const unique = (values: unknown[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values || []) {
    const item = clean(value);
    if (!item || seen.has(item.toLowerCase())) continue;
    seen.add(item.toLowerCase());
    result.push(item);
  }

  return result;
};

const decisionFrom = (
  score: number,
  recommendation?: string,
  redFlagsCount = 0,
  missingCount = 0,
): RecruiterCopilotCandidate["nextStep"] => {
  const rec = String(recommendation || "").toUpperCase();
  if (rec === "INVITA" && score >= 70 && redFlagsCount <= 1) return "INVITE";
  if (rec === "RESPINGE" && score < 40) return "REJECT";
  if (missingCount >= 3 || score < 65) return "FOLLOW_UP";
  return "REVIEW";
};

const badgeFrom = (
  score: number,
  nextStep: RecruiterCopilotCandidate["nextStep"],
  risks: number,
) => {
  if (score >= 85) return "Potrivire";
  if (score >= 74 && risks <= 2) return "Pregătit pentru interviu";
  if (risks >= 3 && score < 80) return "Risc detectat";
  if (nextStep === "REVIEW") return "Necesită revizuire";
  return "Dovezi solide";
};

const explainFallback = (
  candidateName: string,
  score: number,
  recommendation: string,
  risks: number,
) => {
  if (recommendation === "RESPINGE") {
    return `${candidateName} are riscuri sau lipsuri care justifică respingerea ori filtrarea.`;
  }
  if (recommendation === "INVITA") {
    return `${candidateName} are un scor de ${score}% și suficiente dovezi pentru o invitație rapidă.`;
  }
  if (risks > 0) {
    return `${candidateName} arată potențial, dar există gap-uri care merită clarificate.`;
  }
  return `${candidateName} este un candidat solid, dar ar beneficia de o verificare scurtă.`;
};

const buildFallbackQuestions = (
  analysis: CVResult["analysisRaw"],
  jobTitle: string,
  candidateName: string,
) => {
  const missing = unique(analysis?.missingRequirements || []);
  const risks = unique(analysis?.redFlags || []);
  const questions: string[] = [];

  if (missing[0]) questions.push(`Poți detalia experiența ta cu ${missing[0]}?`);
  if (analysis?.githubAnalysis?.profileUrl) {
    questions.push(
      "Ce ai valida în plus în repo-urile tale pentru a demonstra calitatea codului?",
    );
  }
  if (risks[0]) {
    questions.push(`Cum ai clarifica riscul legat de ${risks[0]}?`);
  }
  if (!questions.length) {
    questions.push(`Ce te face potrivit pentru ${jobTitle || "această poziție"}?`);
    questions.push(
      `Care este cea mai relevantă decizie tehnică din parcursul tău, ${candidateName}?`,
    );
  }

  return questions.slice(0, 4);
};

const buildLocalCandidate = (
  cv: CVResult,
  jobTitle: string,
): RecruiterCopilotCandidate => {
  const analysis = cv.analysisRaw;
  const score = clamp(analysis?.finalScore ?? cv.matchScore ?? 0);
  const confidence = clamp(analysis?.confidenceScore ?? (score > 0 ? 68 : 50));
  const recommendation = String(analysis?.recommendation || "REVIZUIRE").toUpperCase();
  const redFlags = unique(analysis?.redFlags || []);
  const missing = unique(analysis?.missingRequirements || []);
  const nextStep = decisionFrom(score, recommendation, redFlags.length, missing.length);
  const evidence = unique([
    ...(analysis?.evidence || []),
    ...(analysis?.matchedRequirements || []).slice(0, 2),
  ]).slice(0, 4);
  const risks = unique([
    ...redFlags.map((item) => `Semnal de risc: ${item}`),
    ...missing.slice(0, 3).map((item) => `Lipsă: ${item}`),
  ]).slice(0, 4);
  const experienceHighlights = unique(
    (analysis?.cvAnalysis?.experience || [])
      .slice(0, 3)
      .map((exp) => {
        const role = clean(exp.title);
        const company = clean(exp.company);
        return company ? `${role || "Rol"} - ${company}` : role;
      }),
  ).filter(Boolean);

  return {
    id: cv.id,
    candidateName: clean(cv.candidateName) || cv.candidateName,
    fileName: clean(cv.fileName) || cv.fileName,
    matchScore: score,
    confidenceScore: confidence,
    recommendation:
      recommendation === "INVITA" || recommendation === "RESPINGE"
        ? recommendation
        : "REVIZUIRE",
    nextStep,
    badge: badgeFrom(score, nextStep, risks.length),
    explanation: explainFallback(
      clean(cv.candidateName) || cv.candidateName,
      score,
      recommendation,
      risks.length,
    ),
    evidence,
    risks,
    experienceHighlights,
    interviewQuestions: buildFallbackQuestions(analysis, jobTitle, cv.candidateName),
    skills: unique([...(analysis?.skills || []), ...(cv.skills || [])]).slice(0, 8),
    languages: unique([...(analysis?.languages || [])]).slice(0, 6),
    domains: unique([...(analysis?.domains || [])]).slice(0, 6),
    github: analysis?.githubAnalysis?.profileUrl
      ? {
          username:
            clean(analysis.githubAnalysis.username) ||
            clean(cv.candidateName) ||
            "GitHub",
          profileUrl: analysis.githubAnalysis.profileUrl,
          score: clamp(analysis.githubAnalysis.githubScore ?? 0),
          evidence: unique(analysis.githubAnalysis.evidence || []).slice(0, 3),
        }
      : null,
    position: 0,
  };
};

const buildFallbackReport = (job: Job): RecruiterCopilotReport => {
  const candidates = (job.cvs || [])
    .filter((cv) => cv.status?.toLowerCase() === "analizat" || Boolean(cv.analysisRaw))
    .map((cv) => buildLocalCandidate(cv, job.title))
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }
      return a.candidateName.localeCompare(b.candidateName, "ro-RO");
    })
    .slice(0, 10)
    .map((candidate, index) => ({ ...candidate, position: index + 1 }));

  const averageScore = candidates.length
    ? Math.round(
        candidates.reduce((sum, candidate) => sum + candidate.matchScore, 0) /
          candidates.length,
      )
    : 0;

  const topCandidate = candidates[0] ?? null;

  return {
    job: {
      id: job.id,
      title: clean(job.title) || job.title,
      category: clean(job.category) || job.category,
      location: clean(job.location) || job.location,
      type: clean(job.type) || job.type,
      status: job.status,
      requirements: clean(job.requirements) || job.requirements,
    },
    summary: {
      totalCandidates: job.cvs?.length || 0,
      analyzedCandidates: candidates.length,
      shortlistCount: candidates.length,
      averageScore,
      topRecommendation: topCandidate?.nextStep ?? "FOLLOW_UP",
      topSignal: topCandidate
        ? `${topCandidate.badge} - ${topCandidate.candidateName}`
        : "Nu există candidați analizați încă",
      highlights: [
        candidates[0]
          ? `1. ${candidates[0].candidateName} - ${candidates[0].matchScore}% potrivire.`
          : "Încă nu există candidați analizați.",
        candidates[1]
          ? `2. ${candidates[1].candidateName} - ${candidates[1].matchScore}% potrivire.`
          : "Al doilea loc nu este încă disponibil.",
        candidates[2]
          ? `3. ${candidates[2].candidateName} - ${candidates[2].matchScore}% potrivire.`
          : "Al treilea loc nu este încă disponibil.",
      ],
      agentMode: "local",
    },
    candidates,
    agent: {
      mode: "local",
      label: "Raport generat local",
      summary:
        "Sinteza a fost construită din datele deja disponibile în aplicație, fără apel AI.",
      trace: [
        {
          step: "date",
          detail: "Raportul a fost reconstruit din jobul și candidații deja încărcați.",
        },
        {
          step: "clasament",
          detail: "Candidații au fost ordonați după scor și încredere.",
        },
        {
          step: "decizie",
          detail: "UI-ul afișează un rezumat complet chiar și fără răspuns AI.",
        },
      ],
      usedFallback: true,
    },
    generatedAt: new Date().toISOString(),
  };
};

const RecruiterCopilotPage: React.FC = () => {
  const location = useLocation();

  const [jobs, setJobs] = useState<{ id: number; title: string }[]>([]);
  const [report, setReport] = useState<RecruiterCopilotReport | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CandidateTab>("rezumat");
  const [actionState, setActionState] = useState<ActionState>({});
  const jobMenuRef = useRef<HTMLDivElement | null>(null);

  const state = (location.state ?? {}) as LocationState;

  const selectedJobTitle = useMemo(() => {
    const found = jobs.find((job) => job.id === selectedJobId);
    return found?.title ?? report?.job.title ?? "Copilot recrutare";
  }, [jobs, report?.job.title, selectedJobId]);

  const selectedCandidate = useMemo(() => {
    if (!report?.candidates?.length) return null;
    return (
      report.candidates.find((candidate) => candidate.id === activeCandidateId) ??
      report.candidates[0]
    );
  }, [activeCandidateId, report]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!jobMenuRef.current) return;
      if (!jobMenuRef.current.contains(event.target as Node)) {
        setJobMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setJobMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const loadReport = async (jobId: number) => {
    setLoadingReport(true);

    try {
      const nextReport = await jobsApi.recruiterCopilot(jobId);
      setReport(nextReport);
      setActiveCandidateId(nextReport.candidates[0]?.id ?? null);
      setActiveTab("rezumat");
      return nextReport;
    } catch (error) {
      try {
        const job = await jobsApi.getById(jobId);
        const fallbackReport = buildFallbackReport(job);
        setReport(fallbackReport);
        setActiveCandidateId(fallbackReport.candidates[0]?.id ?? null);
        setActiveTab("rezumat");
        toast("Raportul a fost generat din datele locale.");
        console.warn("Recruiter Copilot fallback report:", error);
        return fallbackReport;
      } catch (fallbackError) {
        console.error("Recruiter Copilot failed completely:", fallbackError);
        toast.error("Nu am putut genera raportul.");
        return null;
      }
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingJobs(true);
        const jobList = await jobsApi.list();
        if (!mounted) return;

        const nextJobs = jobList.map((job) => ({ id: job.id, title: job.title }));
        setJobs(nextJobs);

        const preferredId =
          state.jobId ?? state.openJobId ?? nextJobs[0]?.id ?? null;
        setSelectedJobId(preferredId);
      } catch {
        if (mounted) {
          setJobs([]);
          setSelectedJobId(null);
          toast.error("Nu pot încărca joburile.");
        }
      } finally {
        if (mounted) setLoadingJobs(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [state.jobId, state.openJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      setReport(null);
      return;
    }

    let mounted = true;

    (async () => {
      const nextReport = await loadReport(selectedJobId);
      if (!mounted) return;
      setReport(nextReport);
    })();

    return () => {
      mounted = false;
    };
  }, [selectedJobId]);

  useEffect(() => {
    if (selectedCandidate && selectedCandidate.id !== activeCandidateId) {
      setActiveCandidateId(selectedCandidate.id);
    }
  }, [activeCandidateId, selectedCandidate]);

  const handleGenerateReport = async () => {
    if (!selectedJobId) return;
    await loadReport(selectedJobId);
    toast.success("Raportul a fost actualizat.");
  };

  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setJobMenuOpen(false);
  };

  const triggerAction = (candidateId: number, action: string) => {
    setActionState((prev) => ({ ...prev, [candidateId]: action }));
    toast.success(`${decisionLabel(action)} setat pentru candidat.`);
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.wrapper}>
        <header className={styles.headerCard}>
          <div className={styles.headerLeft}>
            <div className={styles.kickerRow}>
              <div className={styles.kickerIcon}>
                <RobotIcon size={14} />
              </div>
              <span className={styles.kicker}>Copilot AI pentru recrutare</span>
            </div>

            <h1 className={styles.title}>Agent de decizie pentru recrutare</h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.jobSelectWrap} ref={jobMenuRef}>
              <span className={styles.jobSelectLabel}>
                Job activ
              </span>
              <button
                type="button"
                className={styles.jobTrigger}
                onClick={() => setJobMenuOpen((prev) => !prev)}
                disabled={loadingJobs || !jobs.length}
                aria-haspopup="listbox"
                aria-expanded={jobMenuOpen}
              >
                <span className={styles.jobTriggerText}>
                  {selectedJobTitle || "Niciun job disponibil"}
                </span>
                <span className={styles.jobCaret}>
                  <ChevronDownIcon size={12} />
                </span>
              </button>

              {jobMenuOpen && jobs.length > 0 && (
                <div className={styles.jobMenu} role="listbox" aria-label="Job activ">
                  {jobs.map((job) => {
                    const active = job.id === selectedJobId;
                    return (
                      <button
                        key={job.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={[
                          styles.jobMenuItem,
                          active ? styles.jobMenuItemActive : "",
                        ].join(" ")}
                        onClick={() => handleSelectJob(job.id)}
                      >
                        {job.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="button" className={styles.copyBtn} onClick={handleGenerateReport}>
              <RefreshIcon size={14} />
              Generează raport
            </button>
          </div>
        </header>

        <section className={styles.mainGrid}>
          <aside className={styles.listPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Candidați</p>
                <h3 className={styles.panelTitle}>Sortați după prioritate</h3>
              </div>
              <span className={styles.panelCount}>
                {loadingReport ? "..." : report?.candidates.length ?? 0}
              </span>
            </div>

            {loadingReport ? (
              <div className={styles.emptyState}>Se încarcă clasamentul...</div>
            ) : !report?.candidates.length ? (
              <div className={styles.emptyState}>
                Nu există candidați analizați pentru acest job.
              </div>
            ) : (
              <div className={styles.candidateList}>
                {report.candidates.map((candidate) => {
                  const isActive = candidate.id === selectedCandidate?.id;
                  const latestAction = actionState[candidate.id];

                  return (
                    <div
                      key={candidate.id}
                      role="button"
                      tabIndex={0}
                      className={[
                        styles.candidateCard,
                        isActive ? styles.candidateCardActive : "",
                      ].join(" ")}
                      onClick={() => {
                        setActiveCandidateId(candidate.id);
                        setActiveTab("rezumat");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveCandidateId(candidate.id);
                          setActiveTab("rezumat");
                        }
                      }}
                    >
                      <div className={styles.candidateTopRow}>
                        <div className={styles.candidateIdentity}>
                          <div className={styles.rankBadge}>
                            {candidate.position}
                          </div>
                          <div className={styles.identityCopy}>
                            <strong>{candidate.candidateName}</strong>
                            <span>{candidate.fileName}</span>
                          </div>
                        </div>

                        <div className={styles.scoreBadgeWrap}>
                          <span className={[styles.scoreBadge, scoreTone(candidate.matchScore)].join(" ")}>
                            {candidate.matchScore}%
                          </span>
                        </div>
                      </div>

                      <div className={styles.badgeRow}>
                        <span className={`${styles.softBadge} ${nextStepTone(candidate.nextStep)}`}>
                          {candidate.badge}
                        </span>
                        <span className={styles.softBadge}>
                          Încredere {candidate.confidenceScore}%
                        </span>
                        {latestAction ? (
                          <span className={styles.actionPill}>
                            {decisionLabel(latestAction)}
                          </span>
                        ) : null}
                      </div>

                      <p className={styles.candidateExcerpt}>
                        {candidateCardSummary(candidate)}
                      </p>

                      <div className={styles.actionRow}>
                        {(["INVITE", "REVIEW", "REJECT", "FOLLOW_UP"] as const).map(
                          (action) => (
                            <button
                              key={action}
                              type="button"
                              className={[
                                styles.actionBtn,
                                candidate.nextStep === action
                                  ? styles.actionBtnPrimary
                                  : "",
                              ].join(" ")}
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerAction(candidate.id, action);
                              }}
                            >
                              {decisionLabel(action)}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          <section className={styles.detailPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Detalii decizie</p>
                <h3 className={styles.panelTitle}>
                  {selectedCandidate?.candidateName ?? "Selectează un candidat"}
                </h3>
              </div>
              {selectedCandidate ? (
                <span className={[styles.scoreBadge, scoreTone(selectedCandidate.matchScore)].join(" ")}>
                  {selectedCandidate.matchScore}%
                </span>
              ) : null}
            </div>

            {!selectedCandidate ? (
              <div className={styles.emptyState}>
                Selectează un candidat din clasament pentru a vedea explicația,
                dovezile și întrebările de interviu.
              </div>
            ) : (
              <>
                <div className={styles.detailMetaRow}>
                  <span className={`${styles.softBadge} ${nextStepTone(selectedCandidate.nextStep)}`}>
                    {selectedCandidate.badge}
                  </span>
                  <span className={styles.softBadge}>
                    Pas următor: {decisionLabel(selectedCandidate.nextStep)}
                  </span>
                  <span className={styles.softBadge}>
                    Încredere {selectedCandidate.confidenceScore}%
                  </span>
                </div>

                <div className={styles.tabBar} role="tablist" aria-label="Detalii candidat">
                  {(
                    [
                      ["rezumat", "Rezumat"],
                      ["dovezi", "Dovezi"],
                      ["riscuri", "Riscuri"],
                      ["intrebari", "Întrebări"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === key}
                      className={[
                        styles.tabBtn,
                        activeTab === key ? styles.tabBtnActive : "",
                      ].join(" ")}
                      onClick={() => setActiveTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className={styles.detailBody}>
                  {activeTab === "rezumat" && (
                    <div className={styles.detailSection}>
                      {(() => {
                        const summary = candidatePlainSummary(selectedCandidate);
                        return (
                          <div className={styles.summaryCallout}>
                            <div className={styles.summaryCalloutHeader}>
                              <span className={styles.summaryCalloutKicker}>Evaluare</span>
                              <strong>{summary.title}</strong>
                            </div>
                            <p className={styles.summaryCalloutText}>{summary.subtitle}</p>
                            <div className={styles.summaryCalloutList}>
                              <div className={styles.summaryCalloutRow}>
                                <span className={styles.summaryCalloutLabel}>Scor</span>
                                <span className={styles.summaryCalloutValue}>{summary.scoreLine}</span>
                              </div>
                              <div className={styles.summaryCalloutRow}>
                                <span className={styles.summaryCalloutLabel}>Încredere</span>
                                <span className={styles.summaryCalloutValue}>{summary.confidenceLine}</span>
                              </div>
                              <div className={styles.summaryCalloutRow}>
                                <span className={styles.summaryCalloutLabel}>Recomandare</span>
                                <span className={styles.summaryCalloutValue}>{summary.recommendationLine}</span>
                              </div>
                              <div className={styles.summaryCalloutRow}>
                                <span className={styles.summaryCalloutLabel}>Cerințe</span>
                                <span className={styles.summaryCalloutValue}>{summary.criteriaLine}</span>
                              </div>
                              <div className={styles.summaryCalloutRow}>
                                <span className={styles.summaryCalloutLabel}>Argumente</span>
                                <span className={styles.summaryCalloutValue}>{summary.supportLine}</span>
                              </div>
                            </div>
                            <p className={styles.summaryCalloutNote}>{summary.note}</p>
                          </div>
                        );
                      })()}

                      {selectedCandidate.experienceHighlights.length > 0 && (
                        <div>
                          <p className={styles.detailLabel}>Experiență</p>
                          <div className={styles.pillCloud}>
                            {selectedCandidate.experienceHighlights.map((item) => (
                              <span key={item} className={styles.pill}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={styles.gridTwo}>
                        <div className={styles.miniBox}>
                          <p className={styles.detailLabel}>Competențe</p>
                          <div className={styles.pillCloud}>
                            {selectedCandidate.skills.length ? (
                              selectedCandidate.skills.map((skill) => (
                                <span key={skill} className={styles.pill}>
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className={styles.emptyInline}>N/A</span>
                            )}
                          </div>
                        </div>

                        <div className={styles.miniBox}>
                          <p className={styles.detailLabel}>Domenii</p>
                          <div className={styles.pillCloud}>
                            {selectedCandidate.domains.length ? (
                              selectedCandidate.domains.map((domain) => (
                                <span key={domain} className={styles.pill}>
                                  {domain}
                                </span>
                              ))
                            ) : (
                              <span className={styles.emptyInline}>N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "dovezi" && (
                    <div className={styles.detailSection}>
                      <div className={styles.listBox}>
                        {selectedCandidate.evidence.length ? (
                          selectedCandidate.evidence.map((item) => (
                            <div key={item} className={styles.listItem}>
                              <span className={styles.listDot} />
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyInline}>
                            Nu există dovezi suplimentare.
                          </div>
                        )}
                      </div>

                      {selectedCandidate.github ? (
                        <div className={styles.githubBox}>
                          <div className={styles.githubHeader}>
                            <FileIcon size={14} />
                            <span>{selectedCandidate.github.username}</span>
                            <strong>{selectedCandidate.github.score}%</strong>
                          </div>
                          <div className={styles.pillCloud}>
                            {selectedCandidate.github.evidence.map((item) => (
                              <span key={item} className={styles.pill}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === "riscuri" && (
                    <div className={styles.detailSection}>
                      <div className={styles.listBox}>
                        {selectedCandidate.risks.length ? (
                          selectedCandidate.risks.map((item) => (
                            <div key={item} className={styles.listItemWarn}>
                              <WarningIcon size={12} />
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyInline}>
                            Nu au fost identificate riscuri majore.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "intrebari" && (
                    <div className={styles.detailSection}>
                      <div className={styles.listBox}>
                        {selectedCandidate.interviewQuestions.map((item) => (
                          <div key={item} className={styles.listItem}>
                            <span className={styles.listDot} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </div>
  );
};

export default RecruiterCopilotPage;
