import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routs/paths";
import "./PaginaAuth.css";

import ParticlesBackground from "../../components/ParticlesBackground/ParticlesBackground";
import Notification from "../../components/Notification/Notification";
import Logo from "../../assets/logo.svg";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

import { login, register } from "../../api/auth.service";

/* =========================
   ICON TYPES
   ========================= */
const EnvelopeIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const LockIcon = FaLock as unknown as ComponentType<IconBaseProps>;
const UserIcon = FaUser as unknown as ComponentType<IconBaseProps>;
const GoogleIcon = FaGoogle as unknown as ComponentType<IconBaseProps>;
const EyeIcon = FaEye as unknown as ComponentType<IconBaseProps>;
const EyeSlashIcon = FaEyeSlash as unknown as ComponentType<IconBaseProps>;

/* =========================
   API URL
   ========================= */
const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

const PaginaAuth: React.FC = () => {
  const navigate = useNavigate();

  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Inputs
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

  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);

  const closeNotification = () => setNotification(null);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  /* =========================
     GOOGLE CALLBACK
     ========================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
      setNotification({
        type: "success",
        title: "Autentificare Google",
        message: "Conectare reușită.",
      });
      setTimeout(() => {
        navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
          replace: true,
        });
      }, 700);
    }
  }, [navigate]);

  const handleGoogleAuth = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  /* =========================
     HANDLERS
     ========================= */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: boolean } = {};
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data = await login(email, password);
      localStorage.setItem("access_token", data.access_token);
      setNotification({
        type: "success",
        title: "Succes",
        message: "Bine ai revenit!",
      });
      setTimeout(() => {
        navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
          replace: true,
        });
      }, 700);
    } catch {
      setNotification({
        type: "error",
        title: "Eroare",
        message: "Email sau parolă incorecte.",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: boolean } = {};
    if (!nume) newErrors.nume = true;
    if (!prenume) newErrors.prenume = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(email, password, nume, prenume);
      setNotification({
        type: "success",
        title: "Cont creat",
        message: "Te poți autentifica acum.",
      });
      setTimeout(() => {
        setIsSignUpMode(false);
        setPassword("");
      }, 900);
    } catch {
      setNotification({
        type: "error",
        title: "Eroare",
        message: "Nu am putut crea contul.",
      });
    }
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      {/* Particulele sunt pe fundal, z-index mic */}
      <ParticlesBackground />

      <div className="forms-container">
        <div className="signin-signup">
          {/* ----- LOGIN FORM ----- */}
          <form className="sign-in-form" onSubmit={handleSignIn} noValidate>
            <h2 className="title">Conectare</h2>
            <div className={`input-field ${errors.email ? "error" : ""}`}>
              <div className="icon-wrapper">
                <EnvelopeIcon />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                autoComplete="email"
              />
              <div className="glow-bar"></div>
            </div>

            <div className={`input-field ${errors.password ? "error" : ""}`}>
              <div className="icon-wrapper">
                <LockIcon />
              </div>
              <input
                type={showPasswordSignIn ? "text" : "password"}
                placeholder="Parolă"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}
              >
                {showPasswordSignIn ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
              <div className="glow-bar"></div>
            </div>

            <button type="submit" className="btn btn-liquid">
              Autentificare
            </button>

            <div className="social-divider">
              <span></span>
              <p>sau</p>
              <span></span>
            </div>

            <button
              type="button"
              className="btn-social"
              onClick={handleGoogleAuth}
            >
              <GoogleIcon className="google-icon" /> Google
            </button>
          </form>

          {/* ----- REGISTER FORM ----- */}
          <form className="sign-up-form" onSubmit={handleSignUp} noValidate>
            <h2 className="title">Înregistrare</h2>

            <div className={`input-field ${errors.nume ? "error" : ""}`}>
              <div className="icon-wrapper">
                <UserIcon />
              </div>
              <input
                type="text"
                placeholder="Nume"
                value={nume}
                onChange={(e) => {
                  setNume(e.target.value);
                  clearError("nume");
                }}
              />
              <div className="glow-bar"></div>
            </div>

            <div className={`input-field ${errors.prenume ? "error" : ""}`}>
              <div className="icon-wrapper">
                <UserIcon />
              </div>
              <input
                type="text"
                placeholder="Prenume"
                value={prenume}
                onChange={(e) => {
                  setPrenume(e.target.value);
                  clearError("prenume");
                }}
              />
              <div className="glow-bar"></div>
            </div>

            <div className={`input-field ${errors.email ? "error" : ""}`}>
              <div className="icon-wrapper">
                <EnvelopeIcon />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                autoComplete="email"
              />
              <div className="glow-bar"></div>
            </div>

            <div className={`input-field ${errors.password ? "error" : ""}`}>
              <div className="icon-wrapper">
                <LockIcon />
              </div>
              <input
                type={showPasswordSignUp ? "text" : "password"}
                placeholder="Parolă"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
              >
                {showPasswordSignUp ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
              <div className="glow-bar"></div>
            </div>

            <button type="submit" className="btn btn-liquid">
              Creează Cont
            </button>

            <div className="social-divider">
              <span></span>
              <p>sau</p>
              <span></span>
            </div>

            <button
              type="button"
              className="btn-social"
              onClick={handleGoogleAuth}
            >
              <GoogleIcon className="google-icon" /> Google
            </button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content hero-content-left">
            <div className="hero-logo-left">
              <img src={Logo} />
            </div>
            <h1 className="hero-title-left">Bine ai venit!</h1>
            <p className="hero-subtitle-left">
              Nu ai un cont încă? Creează unul rapid.
            </p>
            <button
              className="hero-button-left"
              onClick={() => setIsSignUpMode(true)}
            >
              Înregistrare
            </button>
          </div>
        </div>

        <div className="panel right-panel">
          <div className="content hero-content-right">
            <div className="hero-logo-right">
              <img src={Logo} />
            </div>
            <h1 className="hero-title-right">Salutare!</h1>
            <p className="hero-subtitle-right">
              Ai deja cont? Conectează-te aici.
            </p>
            <button
              className="hero-button-right"
              onClick={() => setIsSignUpMode(false)}
            >
              Conectare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaAuth;
