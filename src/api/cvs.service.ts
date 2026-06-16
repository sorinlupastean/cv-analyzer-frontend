import { http } from "./http";
import { normalizeUnicodeText } from "../utils/text-normalization";

export type Recommendation = "INVITA" | "REVIZUIRE" | "RESPINGE";

export type CandidateExperience = {
  title: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  responsibilities?: string[];
  technologies?: string[];
};

export type CandidateEducation = {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
};

export type GeminiJobCvAnalysis = {
  candidateName: string;
  email: string | null;
  phone: string | null;
  candidatePhotoDataUrl?: string | null;

  languages: string[];
  domains: string[];

  skills: string[];
  experience: CandidateExperience[];
  education: CandidateEducation[];

  matchedRequirements: string[];
  missingRequirements: string[];
  redFlags: string[];

  summary: string;
  matchScore: number;
  recommendation: Recommendation;
  reasoningShort: string;
  evidence: string[];
};

export type GithubRepositoryAnalysis = {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazersCount: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;

  languages: string[];
  rootFiles: string[];
  hasReadme: boolean;
  hasTests: boolean;
  hasDocker: boolean;
  hasCiCd: boolean;
  hasPackageJson: boolean;
  hasTsConfig: boolean;
  hasBackendIndicators: boolean;
  hasFrontendIndicators: boolean;
  readmeScore: number;
  qualityScore: number;
  activityScore: number;
  relevanceScore: number;

  detectedSkills: string[];
  matchedJobSkills: string[];
  missingJobSkills: string[];
  evidence: string[];
};

export type GithubProfileAnalysis = {
  username: string;
  profileUrl: string;
  usedInScoring: boolean;
  totalPublicRepos: number;
  analyzedReposCount: number;
  githubScore: number;
  confidenceBoost: number;
  validatedSkills: string[];
  unverifiedSkills: string[];
  matchedRequirements: string[];
  missingRequirements: string[];
  redFlags: string[];
  evidence: string[];
  repositories: GithubRepositoryAnalysis[];
};

export type FinalCandidateAnalysis = {
  candidateName: string;
  email: string | null;
  phone: string | null;
  candidatePhotoDataUrl?: string | null;

  cvScore: number;
  githubScore: number | null;
  finalScore: number;
  confidenceScore: number;

  recommendation: Recommendation;

  languages: string[];
  domains: string[];
  skills: string[];

  validatedSkills: string[];
  unverifiedSkills: string[];

  matchedRequirements: string[];
  missingRequirements: string[];
  redFlags: string[];

  summary: string;
  reasoningShort: string;
  evidence: string[];

  cvAnalysis: GeminiJobCvAnalysis;
  githubAnalysis: GithubProfileAnalysis | null;
};

export type Cv = {
  id: number;
  fileName: string;

  candidateName: string;
  uploadDate: string | null;
  matchScore: number;
  status: string;
  skills: string[];

  createdAt: string;
  updatedAt?: string;

  storedName?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;

  email?: string | null;
  phone?: string | null;
  languages?: string[];
  domains?: string[];

  analysisSummary?: string | null;
  analysisRaw?: FinalCandidateAnalysis | null;

  job?: {
    id: number;
    title?: string;
    location?: string;
    type?: string;
    status?: string;
  };
};

export type CreateCvBody = {
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
};

export type SendEmailBody = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

export type CandidatePickerItem = {
  id: number;
  fullName: string;
  email: string;
  label: string;
};

export const cvsPickerApi = {
  search: async (q: string, limit = 20) => {
    const { data } = await http.get<CandidatePickerItem[]>("/picker", {
      params: { q, limit },
    });
    return data.map((item) => ({
      ...item,
      fullName: normalizeUnicodeText(item.fullName) || item.fullName,
      email: normalizeUnicodeText(item.email) || item.email,
      label: normalizeUnicodeText(item.label) || item.label,
    }));
  },
};

const API_URL = process.env.REACT_APP_API_URL;

export const cvsApi = {
  listForJob: async (jobId: number): Promise<Cv[]> => {
    const { data } = await http.get<Cv[]>(`/jobs/${jobId}/cvs`);
    return data.map(normalizeCv);
  },

  getById: async (cvId: number): Promise<Cv> => {
    const { data } = await http.get<Cv>(`/cvs/${cvId}`);
    return normalizeCv(data);
  },

  createForJob: async (jobId: number, body: CreateCvBody): Promise<Cv> => {
    const { data } = await http.post<Cv>(`/jobs/${jobId}/cvs`, body);
    return data;
  },

  uploadForJob: async (jobId: number, file: File): Promise<Cv> => {
    const fd = new FormData();
    fd.append("file", file);

    const { data } = await http.post<Cv>(`/jobs/${jobId}/cvs/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  remove: async (cvId: number): Promise<{ ok: true }> => {
    const { data } = await http.delete<{ ok: true }>(`/cvs/${cvId}`);
    return data;
  },

  getFileUrl: (cv: Cv): string | null => {
    if (!cv?.id) return null;
    const base = http.defaults.baseURL || API_URL;
    if (!base) return null;
    return `${base}/cvs/${cv.id}/download`;
  },

  analyze: async (cvId: number): Promise<Cv> => {
    const { data } = await http.post<Cv>(`/cvs/${cvId}/analyze`, {});
    return normalizeCv(data);
  },

  analyzeForJob: async (jobId: number, cvId: number): Promise<Cv> => {
    const { data } = await http.post<Cv>(
      `/jobs/${jobId}/cvs/${cvId}/analyze`,
      {},
    );
    return normalizeCv(data);
  },

  sendEmail: async (
    cvId: number,
    payload: SendEmailBody,
  ): Promise<{ ok: true }> => {
    const { data } = await http.post<{ ok: true }>(
      `/cvs/${cvId}/send-email`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return data;
  },
};

function normalizeCv(cv: Cv): Cv {
  const safeAnalysis = cv.analysisRaw
    ? {
        ...cv.analysisRaw,
        candidateName:
          normalizeUnicodeText(cv.analysisRaw.candidateName) ||
          cv.analysisRaw.candidateName,
        summary:
          normalizeUnicodeText(cv.analysisRaw.summary) ||
          cv.analysisRaw.summary,
        reasoningShort:
          normalizeUnicodeText(cv.analysisRaw.reasoningShort) ||
          cv.analysisRaw.reasoningShort,
        candidatePhotoDataUrl: cv.analysisRaw.candidatePhotoDataUrl || null,
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
      }
    : cv.analysisRaw;

  return {
    ...cv,
    fileName: normalizeUnicodeText(cv.fileName) || cv.fileName,
    candidateName: normalizeUnicodeText(cv.candidateName) || cv.candidateName,
    status: normalizeUnicodeText(cv.status) || cv.status,
    email: cv.email ? normalizeUnicodeText(cv.email) || cv.email : cv.email,
    phone: cv.phone ? normalizeUnicodeText(cv.phone) || cv.phone : cv.phone,
    analysisSummary:
      cv.analysisSummary
        ? normalizeUnicodeText(cv.analysisSummary) || cv.analysisSummary
        : cv.analysisSummary,
    skills: (cv.skills || []).map((item) => normalizeUnicodeText(item) || item),
    languages: (cv.languages || []).map(
      (item) => normalizeUnicodeText(item) || item,
    ),
    domains: (cv.domains || []).map(
      (item) => normalizeUnicodeText(item) || item,
    ),
    analysisRaw: safeAnalysis,
  };
}
