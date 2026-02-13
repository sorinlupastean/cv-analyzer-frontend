import { http } from "./http";

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
  analysisSummary?: string | null;
  analysisRaw?: any | null;

  job?: { id: number; title?: string };
};

export type CreateCvBody = {
  fileName: string;
  candidateName: string;
  uploadDate: string; // ISO, ex: "2026-02-13"
  matchScore: number;
  status: string;
  skills: string[];
};

const API_URL = process.env.REACT_APP_API_URL; // ex: http://localhost:3001

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
    fd.append("file", file); // trebuie să bată cu FileInterceptor("file")

    const { data } = await http.post<Cv>(`/jobs/${jobId}/cvs/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  remove: async (cvId: number): Promise<{ ok: true }> => {
    const { data } = await http.delete<{ ok: true }>(`/cvs/${cvId}`);
    return data;
  },

  // opțional: util pentru CVDetailsPage
  getPdfUrl: (cv: Cv): string | null => {
    if (!API_URL) return null;
    if (!cv.filePath) return null;

    // dacă în DB ai "uploads/cvs/xxx.pdf" îl transformăm în "/uploads/cvs/xxx.pdf"
    const normalized = cv.filePath
      .replace(/\\/g, "/")
      .replace(/^uploads\//, "");
    return `${API_URL}/uploads/${normalized}`;
  },

  analyze: async (cvId: number): Promise<Cv> => {
    const { data } = await http.post<Cv>(`/cvs/${cvId}/analyze`);
    return data;
  },
};
