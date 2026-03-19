import { http } from "./http";

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

export type Recommendation = "INVITA" | "REVIZUIRE" | "RESPINGE";

export type GeminiJobCvAnalysis = {
  candidateName: string;
  email: string | null;
  phone: string | null;

  languages: string[];
  domains: string[];

  skills: string[];
  experience: CandidateExperience[];
  education: CandidateEducation[];

  summary: string;
  matchScore: number;
  recommendation: Recommendation;
  reasoningShort: string;
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

  storedName?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;

  // NOU: le primesti direct din backend
  email?: string | null;
  phone?: string | null;
  languages?: string[];
  domains?: string[];

  analysisSummary?: string | null;
  analysisRaw?: GeminiJobCvAnalysis | any | null;

  job?: { id: number; title?: string };
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
  to: string; // email candidat
  subject: string;
  html?: string; // dacă trimiți HTML
  text?: string; // dacă trimiți plain text
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
    if (!API_URL) return null;

    if (cv.storedName) {
      return `${API_URL}/uploads/cvs/${encodeURIComponent(cv.storedName)}`;
    }

    if (cv.filePath) {
      const p = String(cv.filePath).replace(/\\/g, "/");
      if (!/^[a-zA-Z]:\//.test(p)) {
        const normalized = p.replace(/^.*\/uploads\//, "");
        return `${API_URL}/uploads/${normalized}`;
      }
    }

    return null;
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
    payload: { to: string; subject: string; text: string; html?: string },
  ) => {
    const { data } = await http.post(`/cvs/${cvId}/send-email`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },
};
