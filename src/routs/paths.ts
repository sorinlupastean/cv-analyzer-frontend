// src/routes/paths.ts
export const PATHS = {
  ROOT: "/",
  DASHBOARD: {
    ROOT: "/dashboard",
    HOME: "home",
    CREATE_JOB: "create-job",
    UPLOAD_CV: "upload-cv",
    RESULTS: "results",
    SETTINGS: "settings",
    CV_DETAILS: (id: string = ":id") => `cv/${id}`, // Funcție pentru parametri dinamici
    CALENDAR: "calendar",
  },
};
