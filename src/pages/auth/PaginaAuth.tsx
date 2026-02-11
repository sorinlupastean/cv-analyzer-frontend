import React, { useState } from "react";
import "./PaginaAuth.css";

import ParticlesBackground from "../../components/ParticlesBackground/ParticlesBackground";
import Hologram from "../../components/Hologram/Hologram";
import Notification from "../../components/Notification/Notification";

import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

import { login, register } from "../../api/auth.service";

const EnvelopeIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const LockIcon = FaLock as unknown as ComponentType<IconBaseProps>;
const UserIcon = FaUser as unknown as ComponentType<IconBaseProps>;

interface PaginaAuthProps {
  onAuthSuccess: () => void;
}

const PaginaAuth: React.FC<PaginaAuthProps> = ({ onAuthSuccess }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const closeNotification = () => setNotification(null);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  /* =========================
     LOGIN REAL (BACKEND)
     ========================= */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login(email, password);

      localStorage.setItem("access_token", data.access_token);

      setNotification({
        type: "success",
        title: "Autentificare reușită",
        message: "Accesul a fost acordat.",
      });

      setTimeout(() => onAuthSuccess(), 800);
    } catch (error) {
      setNotification({
        type: "error",
        title: "Autentificare eșuată",
        message: "Email sau parolă incorectă.",
      });
    }
  };

  /* =========================
     REGISTER REAL (BACKEND)
     ========================= */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(email, password, nume, prenume);

      setNotification({
        type: "success",
        title: "Cont creat",
        message: "Te poți autentifica folosind datele introduse.",
      });

      setTimeout(() => {
        setIsSignUpMode(false);
        setPassword("");
      }, 1000);
    } catch (error) {
      setNotification({
        type: "error",
        title: "Eroare",
        message: "Contul nu a putut fi creat.",
      });
    }
  };

  return (
    <div className={isSignUpMode ? "container sign-up-mode" : "container"}>
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <ParticlesBackground />

      <div className="forms-container">
        <div className="signin-signup">
          {/* CONECTARE */}
          <form className="sign-in-form" onSubmit={handleSignIn}>
            <h2 className="title">Conectare</h2>
            <p className="subtitle">
              Acces la platforma de analiză și evaluare a CV-urilor
            </p>

            <div className={`input-field ${errors.email ? "error" : ""}`}>
              <div className="icon-wrapper">
                <EnvelopeIcon />
              </div>
              <input
                type="email"
                placeholder="Adresă de email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
              />
              <div className="glow-bar"></div>
            </div>

            <div className={`input-field ${errors.password ? "error" : ""}`}>
              <div className="icon-wrapper">
                <LockIcon />
              </div>
              <input
                type="password"
                placeholder="Parolă"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
              />
              <div className="glow-bar"></div>
            </div>

            <button type="submit" className="btn btn-liquid">
              Autentificare
            </button>
          </form>

          {/* ÎNREGISTRARE */}
          <form className="sign-up-form" onSubmit={handleSignUp}>
            <h2 className="title">Creare cont</h2>
            <p className="subtitle">Înregistrare utilizator nou în sistem</p>

            <div className="input-field">
              <div className="icon-wrapper">
                <UserIcon />
              </div>
              <input
                type="text"
                placeholder="Nume"
                value={nume}
                onChange={(e) => setNume(e.target.value)}
              />
              <div className="glow-bar"></div>
            </div>

            <div className="input-field">
              <div className="icon-wrapper">
                <UserIcon />
              </div>
              <input
                type="text"
                placeholder="Prenume"
                value={prenume}
                onChange={(e) => setPrenume(e.target.value)}
              />
              <div className="glow-bar"></div>
            </div>

            <div className="input-field">
              <div className="icon-wrapper">
                <EnvelopeIcon />
              </div>
              <input
                type="email"
                placeholder="Adresă de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="glow-bar"></div>
            </div>

            <div className="input-field">
              <div className="icon-wrapper">
                <LockIcon />
              </div>
              <input
                type="password"
                placeholder="Parolă"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="glow-bar"></div>
            </div>

            <button type="submit" className="btn btn-liquid">
              Creează cont
            </button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>Nu ai cont?</h3>
            <p>
              Creează un cont pentru a utiliza funcționalitățile platformei.
            </p>
            <button
              className="btn transparent"
              onClick={() => setIsSignUpMode(true)}
            >
              Creează cont
            </button>
          </div>
          <Hologram variant="primary" isVisible={!isSignUpMode} />
        </div>

        <div className="panel right-panel">
          <div className="content">
            <h3>Ai deja cont?</h3>
            <p>Autentifică-te pentru a continua.</p>
            <button
              className="btn transparent"
              onClick={() => setIsSignUpMode(false)}
            >
              Autentificare
            </button>
          </div>
          <Hologram variant="secondary" isVisible={isSignUpMode} />
        </div>
      </div>
    </div>
  );
};

export default PaginaAuth;
