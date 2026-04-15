import { http } from "./http";

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
