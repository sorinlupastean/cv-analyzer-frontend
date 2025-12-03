import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Importă Paginile ---
// Asigură-te că aceste căi (path-uri) sunt corecte
import PaginaAuth from "./pagini/înregistrare/PaginaAuth";
import HomePage from "./pagini/dashboard/HomePage";
import CreateJobPage from "./pagini/dashboard/CreateJobPage";
import UploadCVPage from "./pagini/dashboard/UploadCVPage";
import ResultsPage from "./pagini/dashboard/ResultsPage";
import CVDetailsPage from "./pagini/dashboard/CVDetailsPage";

import "./App.css";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                // Dacă NU ești logat, arată PaginaAuth
                // Trimitem funcția 'handleAuthSuccess' ca 'onAuthSuccess'
                <PaginaAuth onAuthSuccess={handleAuthSuccess} />
              ) : (
                // Dacă EȘTI logat, redirecționează automat la dashboard
                <Navigate to="/dashboard/home" replace />
              )
            }
          />

          {/* --- Ruta 2: Rutele Protejate din Dashboard --- */}
          {isAuthenticated ? (
            <>
              {/* Când ești logat, aceste rute devin active */}
              <Route path="/dashboard/home" element={<HomePage />} />
              <Route path="/dashboard/create-job" element={<CreateJobPage />} />
              <Route path="/dashboard/upload-cv" element={<UploadCVPage />} />
              <Route path="/dashboard/results" element={<ResultsPage />} />
              <Route path="/cv/:id" element={<CVDetailsPage />} />
            </>
          ) : (
            <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
