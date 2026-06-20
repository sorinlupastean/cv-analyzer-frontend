import { http } from "./http";
import { normalizeUnicodeText } from "../utils/text-normalization";

export type CVResult = {
  id: number;
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
  analysisRaw?: {
    finalScore?: number;
    confidenceScore?: number;
    recommendation?: "INVITA" | "REVIZUIRE" | "RESPINGE";
    summary?: string;
    reasoningShort?: string;
    evidence?: string[];
    matchedRequirements?: string[];
    missingRequirements?: string[];
    redFlags?: string[];
    skills?: string[];
    languages?: string[];
    domains?: string[];
    cvAnalysis?: {
      experience?: Array<{
        title?: string;
        company?: string;
        location?: string;
      }>;
      candidatePhotoDataUrl?: string | null;
    } | null;
    githubAnalysis?: {
      username?: string;
      profileUrl?: string;
      githubScore?: number;
      evidence?: string[];
    } | null;
  } | null;
};

export type JobStatus = "ACTIVE" | "CLOSED";

export type Job = {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  cvs: CVResult[];
};

export type RecruiterCopilotDecision =
  | "INVITE"
  | "REVIEW"
  | "REJECT"
  | "FOLLOW_UP";

export type RecruiterCopilotCandidate = {
  id: number;
  candidateName: string;
  fileName: string;
  matchScore: number;
  confidenceScore: number;
  recommendation: "INVITA" | "REVIZUIRE" | "RESPINGE";
  nextStep: RecruiterCopilotDecision;
  badge: string;
  explanation: string;
  evidence: string[];
  risks: string[];
  experienceHighlights: string[];
  interviewQuestions: string[];
  skills: string[];
  languages: string[];
  domains: string[];
  github: {
    username: string;
    profileUrl: string;
    score: number;
    evidence: string[];
  } | null;
  position: number;
};

export type RecruiterCopilotReport = {
  job: {
    id: number;
    title: string;
    category: string;
    location: string;
    type: string;
    status: JobStatus;
    requirements: string;
  };
  summary: {
    totalCandidates: number;
    analyzedCandidates: number;
    shortlistCount: number;
    averageScore: number;
    topRecommendation: RecruiterCopilotDecision;
    topSignal: string;
    highlights: string[];
    agentMode?: "ai" | "local";
  };
  candidates: RecruiterCopilotCandidate[];
  agent?: {
    mode: "ai" | "local";
    label: string;
    summary: string;
    trace: Array<{
      step: string;
      detail: string;
    }>;
    usedFallback: boolean;
  };
  generatedAt: string;
};

export type CreateJobBody = {
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string; // nou
  status?: JobStatus; // opțional, backend poate seta default ACTIVE
};

export type UpdateJobBody = Partial<CreateJobBody> & {
  status?: JobStatus; // explicit, ca să fie clar că acceptăm status în update
};

export const jobsApi = {
  list: async (): Promise<Job[]> => {
    const { data } = await http.get<Job[]>("/jobs");
    return data.map(normalizeJob);
  },

  getById: async (id: number): Promise<Job> => {
    const { data } = await http.get<Job>(`/jobs/${id}`);
    return normalizeJob(data);
  },

  create: async (body: CreateJobBody): Promise<Job> => {
    const payload: CreateJobBody = {
      ...body,
      status: body.status ?? "ACTIVE",
      requirements: body.requirements ?? "",
    };

    const { data } = await http.post<Job>("/jobs", payload);
    return normalizeJob(data);
  },

  update: async (id: number, body: UpdateJobBody): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}`, body);
    return normalizeJob(data);
  },

  setStatus: async (id: number, status: JobStatus): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/status`, { status });
    return normalizeJob(data);
  },

  close: async (id: number): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/close`, {});
    return normalizeJob(data);
  },

  activate: async (id: number): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/activate`, {});
    return normalizeJob(data);
  },

  recruiterCopilot: async (id: number): Promise<RecruiterCopilotReport> => {
    const { data } = await http.get<RecruiterCopilotReport>(
      `/jobs/${id}/recruiter-copilot`,
    );
    return data;
  },

  remove: async (id: number): Promise<{ ok: true }> => {
    const { data } = await http.delete<{ ok: true }>(`/jobs/${id}`);
    return data;
  },

  canMutate: (job: Pick<Job, "status">) => job.status === "ACTIVE",
};

function normalizeCvResult(cv: CVResult): CVResult {
  return {
    ...cv,
    fileName: normalizeUnicodeText(cv.fileName) || cv.fileName,
    candidateName: normalizeUnicodeText(cv.candidateName) || cv.candidateName,
    status: normalizeUnicodeText(cv.status) || cv.status,
    skills: (cv.skills || []).map((skill) => normalizeUnicodeText(skill) || skill),
    analysisRaw: cv.analysisRaw
      ? {
          ...cv.analysisRaw,
          summary:
            normalizeUnicodeText(cv.analysisRaw.summary) || cv.analysisRaw.summary,
          reasoningShort:
            normalizeUnicodeText(cv.analysisRaw.reasoningShort) ||
            cv.analysisRaw.reasoningShort,
          evidence: (cv.analysisRaw.evidence || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          matchedRequirements: (cv.analysisRaw.matchedRequirements || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          missingRequirements: (cv.analysisRaw.missingRequirements || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          redFlags: (cv.analysisRaw.redFlags || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          skills: (cv.analysisRaw.skills || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          languages: (cv.analysisRaw.languages || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          domains: (cv.analysisRaw.domains || []).map(
            (item) => normalizeUnicodeText(item) || item,
          ),
          cvAnalysis: cv.analysisRaw.cvAnalysis
            ? {
                ...cv.analysisRaw.cvAnalysis,
                experience: (cv.analysisRaw.cvAnalysis.experience || []).map(
                  (experience) => ({
                    ...experience,
                    title:
                      normalizeUnicodeText(experience.title) ||
                      experience.title,
                    company:
                      normalizeUnicodeText(experience.company) ||
                      experience.company,
                    location:
                      normalizeUnicodeText(experience.location) ||
                      experience.location,
                  }),
                ),
              }
            : null,
          githubAnalysis: cv.analysisRaw.githubAnalysis
            ? {
                ...cv.analysisRaw.githubAnalysis,
                username:
                  normalizeUnicodeText(cv.analysisRaw.githubAnalysis.username) ||
                  cv.analysisRaw.githubAnalysis.username,
                evidence: (cv.analysisRaw.githubAnalysis.evidence || []).map(
                  (item) => normalizeUnicodeText(item) || item,
                ),
              }
            : null,
        }
      : cv.analysisRaw,
  };
}

function isAnalyzedCvResult(cv: CVResult): boolean {
  return String(cv.status ?? "").trim().toLowerCase() === "analizat";
}

function normalizeJob(job: Job): Job {
  const cvs = (job.cvs || [])
    .map(normalizeCvResult)
    .filter(isAnalyzedCvResult);

  return {
    ...job,
    title: normalizeUnicodeText(job.title) || job.title,
    category: normalizeUnicodeText(job.category) || job.category,
    location: normalizeUnicodeText(job.location) || job.location,
    type: normalizeUnicodeText(job.type) || job.type,
    description: normalizeUnicodeText(job.description) || job.description,
    requirements: normalizeUnicodeText(job.requirements) || job.requirements,
    status: (normalizeUnicodeText(job.status) || job.status) as JobStatus,
    cvs,
  };
}
