import { http } from "./http";

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
    return data;
  },
};

const API_URL = process.env.REACT_APP_API_URL;

export const cvsApi = {
  listForJob: async (jobId: number): Promise<Cv[]> => {
    const { data } = await http.get<Cv[]>(`/jobs/${jobId}/cvs`);
    return data;
  },

  getById: async (cvId: number): Promise<Cv> => {
    const { data } = await http.get<Cv>(`/cvs/${cvId}`);
    return data;
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
    return data;
  },

  analyzeForJob: async (jobId: number, cvId: number): Promise<Cv> => {
    const { data } = await http.post<Cv>(
      `/jobs/${jobId}/cvs/${cvId}/analyze`,
      {},
    );
    return data;
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
