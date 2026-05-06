// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "./routs/paths";
import AppToaster from "./components/notifications/AppToaster";

// Components
import ProtectedRoute from "./routs/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import PaginaAuth from "./pages/auth/PaginaAuth";
import HomePage from "./pages/dashboard/HomePage";
import CreateJobPage from "./pages/dashboard/CreateJobPage";
import UploadCVPage from "./pages/dashboard/UploadCVPage";
import CVDetailsPage from "./pages/dashboard/CVDetailsPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

import InterviewConfirmPage from "./pages/interview/InterviewConfirmPage";
import InterviewCancelPage from "./pages/interview/InterviewCancelPage";

import "./App.css";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <AppToaster />
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route
          path={PATHS.ROOT}
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

        {/* TOKEN ROUTES (TOP LEVEL, NOT NESTED UNDER /dashboard) */}
        <Route path="/interview/confirm" element={<InterviewConfirmPage />} />
        <Route path="/interview/cancel" element={<InterviewCancelPage />} />

        {/* PROTECTED ROUTES */}
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
