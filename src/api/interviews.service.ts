import { http } from "./http";

export type InterviewStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED";

export type InterviewEventDto = {
  id: number;
  title: string;
  candidateName: string;
  candidateEmail: string;
  location?: string | null;
  notes?: string | null;
  startAt: string;
  endAt: string;
  status: InterviewStatus;
  meetLink?: string | null;
  cvId?: number | null;
  createdById?: number | null;
};

export const interviewsApi = {
  list: async (from: string, to: string) => {
    const { data } = await http.get<InterviewEventDto[]>("/interviews", {
      params: { from, to },
    });
    return data;
  },

  create: async (payload: Omit<InterviewEventDto, "id">) => {
    const { data } = await http.post<InterviewEventDto>("/interviews", payload);
    return data;
  },

  update: async (
    id: number,
    payload: Partial<Omit<InterviewEventDto, "id">>,
  ) => {
    const { data } = await http.patch<InterviewEventDto>(
      `/interviews/${id}`,
      payload,
    );
    return data;
  },

  cancel: async (id: number, reason?: string) => {
    const { data } = await http.post<InterviewEventDto>(
      `/interviews/${id}/cancel`,
      { reason },
    );
    return data;
  },
};
