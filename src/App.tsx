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
  // Ideal acest state ar trebui să fie într-un Context sau Redux/Zustand
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTA PUBLICĂ (LOGIN) --- */}
        <Route
          path={PATHS.ROOT}
          element={
            !isAuthenticated ? (
              <PaginaAuth onAuthSuccess={handleAuthSuccess} />
            ) : (
              // Dacă e deja logat, trimite-l direct în dashboard
              <Navigate
                to={`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`}
                replace
              />
            )
          }
        />

        {/* --- RUTE PROTEJATE --- */}
        {/* 1. Verificăm autentificarea */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          {/* 2. Aplicăm Layout-ul Dashboard-ului */}
          <Route path={PATHS.DASHBOARD.ROOT} element={<DashboardLayout />}>
            {/* 3. Rutele efective (copiii Outlet-ului din Layout) */}

            {/* Redirect automat de la /dashboard la /dashboard/home */}
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

            {/* Ruta dinamică pentru detalii CV */}
            <Route path={`cv/:id`} element={<CVDetailsPage />} />
          </Route>
        </Route>

        {/* --- 404 NOT FOUND (Opțional, dar recomandat) --- */}
        <Route path="*" element={<Navigate to={PATHS.ROOT} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
