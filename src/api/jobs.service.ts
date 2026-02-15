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
    return data;
  },

  getById: async (id: number): Promise<Job> => {
    const { data } = await http.get<Job>(`/jobs/${id}`);
    return data;
  },

  create: async (body: CreateJobBody): Promise<Job> => {
    const payload: CreateJobBody = {
      ...body,
      status: body.status ?? "ACTIVE",
      requirements: body.requirements ?? "",
    };

    const { data } = await http.post<Job>("/jobs", payload);
    return data;
  },

  update: async (id: number, body: UpdateJobBody): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}`, body);
    return data;
  },

  setStatus: async (id: number, status: JobStatus): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/status`, { status });
    return data;
  },

  close: async (id: number): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/close`, {});
    return data;
  },

  activate: async (id: number): Promise<Job> => {
    const { data } = await http.patch<Job>(`/jobs/${id}/activate`, {});
    return data;
  },

  remove: async (id: number): Promise<{ ok: true }> => {
    const { data } = await http.delete<{ ok: true }>(`/jobs/${id}`);
    return data;
  },

  canMutate: (job: Pick<Job, "status">) => job.status === "ACTIVE",
};
