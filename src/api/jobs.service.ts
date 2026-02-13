import { http } from "./http";

export type CVResult = {
  id: number;
  fileName: string;
  candidateName: string;
  uploadDate: string;
  matchScore: number;
  status: string;
  skills: string[];
};

export type Job = {
  id: number;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  createdAt: string;
  cvs: CVResult[];
};

export type CreateJobBody = {
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
};

export const jobsApi = {
  list: async (): Promise<Job[]> => {
    const { data } = await http.get<Job[]>("/jobs");
    return data;
  },

  create: async (body: CreateJobBody): Promise<Job> => {
    const { data } = await http.post<Job>("/jobs", body);
    return data;
  },

  update: async (id: number, body: Partial<CreateJobBody>): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}`, body);
    return data;
  },

  remove: async (id: number): Promise<{ ok: true }> => {
    const { data } = await http.delete<{ ok: true }>(`/jobs/${id}`);
    return data;
  },
};
