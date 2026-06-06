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
    status: normalizeUnicodeText(job.status) || job.status,
    cvs,
  };
}
