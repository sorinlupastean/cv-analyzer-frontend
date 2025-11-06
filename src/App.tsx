import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Importă Paginile ---
// Asigură-te că aceste căi (path-uri) sunt corecte
import PaginaAuth from "./pagini/înregistrare/PaginaAuth";
import HomePage from "./pagini/dashboard/HomePage";
import CreateJobPage from "./pagini/dashboard/CreateJobPage";
// import UploadCVsPage from "./pagini/dashboard/UploadCVsPage"; // Adaugă-le când le creezi
// import ResultsPage from "./pagini/dashboard/ResultsPage";
// import SettingsPage from "./pagini/dashboard/SettingsPage";

import "./App.css";

const App: React.FC = () => {
  // 1. Starea de autentificare
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 2. Funcție pentru a schimba starea la login reușit
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* --- Ruta 1: Pagina de Autentificare (sau Home dacă ești logat) --- */}
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

              {/* TODO: Adaugă rute pentru restul paginilor tale */}
              {/* <Route path="/dashboard/upload-cvs" element={<UploadCVsPage />} /> */}
              {/* <Route path="/dashboard/results" element={<ResultsPage />} /> */}
              {/* <Route path="/dashboard/settings" element={<SettingsPage />} /> */}

              {/* TODO: Adaugă o rută pentru Logout care setează isAuthenticated = false */}
              {/* <Route path="/logout" element={<LogoutComponent onLogout={() => setIsAuthenticated(false)} />} /> */}
            </>
          ) : (
            /* Dacă NU ești logat și încerci să accesezi /dashboard/ceva,
              ești redirecționat la pagina de login ("/")
            */
            <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
