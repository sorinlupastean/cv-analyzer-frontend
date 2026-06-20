// src/App.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { PATHS } from "./routs/paths";
import AppToaster from "./components/notifications/AppToaster";

// Components
import ProtectedRoute from "./routs/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import LandingPage from "./pages/landing/LandingPage";
import PaginaAuth from "./pages/auth/PaginaAuth";
import HomePage from "./pages/dashboard/HomePage";
import CreateJobPage from "./pages/dashboard/CreateJobPage";
import UploadCVPage from "./pages/dashboard/UploadCVPage";
import CVDetailsPage from "./pages/dashboard/CVDetailsPage";
import RecruiterCopilotPage from "./pages/dashboard/RecruiterCopilotPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

import InterviewConfirmPage from "./pages/interview/InterviewConfirmPage";
import InterviewCancelPage from "./pages/interview/InterviewCancelPage";

import "./App.css";

const APP_NAME = "CV Analyzer Studio";

const routeTitles: Array<{ path: RegExp; title: string }> = [
  { path: /^\/$/, title: "Acasă" },
  { path: /^\/auth\/login$/, title: "Autentificare" },
  { path: /^\/auth\/register$/, title: "Înregistrare" },
  { path: /^\/dashboard\/?$/, title: "Dashboard" },
  { path: /^\/dashboard\/home$/, title: "Dashboard" },
  { path: /^\/dashboard\/create-job$/, title: "Creare job" },
  { path: /^\/dashboard\/upload-cv$/, title: "Încărcare CV" },
  { path: /^\/dashboard\/recruiter-copilot$/, title: "Recruiter Copilot" },
  { path: /^\/dashboard\/cv-details\/.+$/, title: "Detalii CV" },
  { path: /^\/dashboard\/calendar$/, title: "Calendar" },
  { path: /^\/dashboard\/settings$/, title: "Setări" },
  { path: /^\/interview\/confirm$/, title: "Confirmare interviu" },
  { path: /^\/interview\/cancel$/, title: "Anulare interviu" },
];

const DocumentTitle: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const matchedRoute = routeTitles.find(({ path }) =>
      path.test(location.pathname),
    );
    const suffix = matchedRoute?.title;

    document.title = suffix ? `${suffix} | ${APP_NAME}` : APP_NAME;
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <AppToaster />
      <DocumentTitle />
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route
          path={PATHS.ROOT}
          element={
            !isAuthenticated ? (
              <LandingPage />
            ) : (
              <Navigate
                to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`}
                replace
              />
            )
          }
        />

        <Route
          path={PATHS.AUTH.ROOT}
          element={<Navigate to={PATHS.AUTH.LOGIN} replace />}
        />

        <Route
          path={PATHS.AUTH.LOGIN}
          element={
            !isAuthenticated ? (
              <PaginaAuth />
            ) : (
              <Navigate
                to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`}
                replace
              />
            )
          }
        />

        <Route
          path={PATHS.AUTH.REGISTER}
          element={
            !isAuthenticated ? (
              <PaginaAuth />
            ) : (
              <Navigate
                to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`}
                replace
              />
            )
          }
        />

        <Route path="/interview/confirm" element={<InterviewConfirmPage />} />
        <Route path="/interview/cancel" element={<InterviewCancelPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.DASHBOARD.ROOT} element={<DashboardLayout />}>
            <Route
              index
              element={<Navigate to={PATHS.DASHBOARD.HOME} replace />}
            />
            <Route path={PATHS.DASHBOARD.HOME} element={<HomePage />} />
            <Route
              path={PATHS.DASHBOARD.CREATE_JOB}
              element={<CreateJobPage />}
            />
            <Route
              path={PATHS.DASHBOARD.UPLOAD_CV}
              element={<UploadCVPage />}
            />
            <Route
              path={PATHS.DASHBOARD.COPILOT}
              element={<RecruiterCopilotPage />}
            />
            <Route
              path={PATHS.DASHBOARD.CV_DETAILS()}
              element={<CVDetailsPage />}
            />
            <Route path={PATHS.DASHBOARD.CALENDAR} element={<CalendarPage />} />
            <Route path={PATHS.DASHBOARD.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={PATHS.ROOT} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
