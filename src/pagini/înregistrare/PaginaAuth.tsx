import React, { useState } from "react";
import "./PaginaAuth.css";

// --- Importă SVG-urile ---
import { ReactComponent as UserIcon } from "../../assets/account.svg";
import { ReactComponent as EmailIcon } from "../../assets/email.svg";
import { ReactComponent as LockIcon } from "../../assets/password.svg";

import LogSvg from "../../assets/conectare.svg";
import RegisterSvg from "../../assets/inregistrare.svg";

// --- Tipul de proprietăți primite ---
interface PaginaAuthProps {
  onAuthSuccess: () => void;
}

const PaginaAuth: React.FC<PaginaAuthProps> = ({ onAuthSuccess }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // --- Handlere pentru comutarea modurilor ---
  const signUpHandler = () => setIsSignUpMode(true);
  const signInHandler = () => setIsSignUpMode(false);

  // --- Autentificare ---
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // ⚠️ TODO: Logica reală (validare + API/Cognito)
    console.log("Simulare Autentificare reușită.");
    onAuthSuccess();
  };

  // --- Înregistrare ---
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // ⚠️ TODO: Logica reală (înregistrare + salvare user)
    console.log("Simulare Înregistrare reușită.");
    onAuthSuccess();
  };

  // --- Clasă dinamică pentru animație ---
  const containerClasses = isSignUpMode
    ? "container sign-up-mode"
    : "container";

  return (
    <div className={containerClasses}>
      {/* ==================== FORMS ==================== */}
      <div className="forms-container">
        <div className="signin-signup">
          {/* ----- FORMULAR AUTENTIFICARE ----- */}
          <form className="sign-in-form" onSubmit={handleSignIn}>
            <h2 className="title">Autentificare</h2>

            <div className="input-field">
              <EmailIcon />
              <input type="email" placeholder="Email" required />
            </div>

            <div className="input-field">
              <LockIcon />
              <input type="password" placeholder="Parolă" required />
            </div>

            <input type="submit" value="Autentificare" className="btn solid" />
          </form>

          {/* ----- FORMULAR ÎNREGISTRARE ----- */}
          <form className="sign-up-form" onSubmit={handleSignUp}>
            <h2 className="title">Înregistrare</h2>

            <div className="input-field">
              <UserIcon />
              <input type="text" placeholder="Nume" required />
            </div>

            <div className="input-field">
              <UserIcon />
              <input type="text" placeholder="Prenume" required />
            </div>

            <div className="input-field">
              <EmailIcon />
              <input type="email" placeholder="Email" required />
            </div>

            <div className="input-field">
              <LockIcon />
              <input type="password" placeholder="Parolă" required />
            </div>

            <div className="input-field">
              <LockIcon />
              <input type="password" placeholder="Confirmă parola" required />
            </div>

            <input type="submit" className="btn" value="Înregistrează-te" />
          </form>
        </div>
      </div>

      {/* ==================== PANELS ==================== */}
      <div className="panels-container">
        {/* Panel Stânga (Login) */}
        <div className="panel left-panel">
          <div className="content">
            <h3>Ești nou aici?</h3>
            <p>
              Creează-ți un cont acum pentru a te alătura comunității noastre!
            </p>
            <button className="btn transparent" onClick={signUpHandler}>
              Înregistrare
            </button>
          </div>
          <img src={LogSvg} className="image" alt="Autentificare ilustrație" />
        </div>

        {/* Panel Dreapta (Register) */}
        <div className="panel right-panel">
          <div className="content">
            <h3>Faci deja parte din comunitate?</h3>
            <p>Autentifică-te pentru a-ți accesa contul și a continua.</p>
            <button className="btn transparent" onClick={signInHandler}>
              Autentificare
            </button>
          </div>
          <img
            src={RegisterSvg}
            className="image"
            alt="Înregistrare ilustrație"
          />
        </div>
      </div>
    </div>
  );
};

export default PaginaAuth;
