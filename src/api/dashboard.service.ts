import { http } from "./http";

export type ScoreEvolutionPoint = {
  name: string;
  score: number;
  candidates: number;
};

export type SkillPoint = {
  name: string;
  value: number; // count
};

export type HomeDashboardDto = {
  kpis: {
    cvsUploadedLast30: number;
    cvsUploadedDeltaPct: number;

    cvsAnalyzedLast30: number;
    analyzedRateLast30: number;

    avgMatchLast30: number;

    invitedLast30: number;
    invitedRateLast30: number;
  };
  charts: {
    scoreEvolution: ScoreEvolutionPoint[];
    topSkillsLast30: SkillPoint[];
  };
};

export const dashboardApi = {
  async getHome() {
    const res = await http.get<HomeDashboardDto>("/dashboard/home");
    return res.data;
  },
};
