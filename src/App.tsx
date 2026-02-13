// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "./routs/paths";

// Components
import ProtectedRoute from "./routs/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import PaginaAuth from "./pages/auth/PaginaAuth";
import HomePage from "./pages/dashboard/HomePage";
import CreateJobPage from "./pages/dashboard/CreateJobPage";
import UploadCVPage from "./pages/dashboard/UploadCVPage";
import ResultsPage from "./pages/dashboard/ResultsPage";
import CVDetailsPage from "./pages/dashboard/CVDetailsPage";

import "./App.css";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");

  return (
    <BrowserRouter>
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
            <Route path={PATHS.DASHBOARD.RESULTS} element={<ResultsPage />} />
            <Route path={`cv/:id`} element={<CVDetailsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={PATHS.ROOT} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
