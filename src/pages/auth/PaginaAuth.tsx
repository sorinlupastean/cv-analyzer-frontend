import React, { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PATHS } from "../../routs/paths";
import styles from "./PaginaAuth.module.css";

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

const EnvelopeIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const LockIcon = FaLock as unknown as ComponentType<IconBaseProps>;
const UserIcon = FaUser as unknown as ComponentType<IconBaseProps>;
const GoogleIcon = FaGoogle as unknown as ComponentType<IconBaseProps>;
const EyeIcon = FaEye as unknown as ComponentType<IconBaseProps>;
const EyeSlashIcon = FaEyeSlash as unknown as ComponentType<IconBaseProps>;

const ParticlesBackground = lazy(
  () => import("../../components/ParticlesBackground/ParticlesBackground"),
);

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_AUTH_URL = API_URL ? `${API_URL}/auth/google` : "/auth/google";

const PaginaAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUpMode, setIsSignUpMode] = useState(
    location.pathname === PATHS.AUTH.REGISTER,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      return;
    }

    localStorage.setItem("access_token", token);
    window.history.replaceState({}, document.title, window.location.pathname);
    toast.success("Conectare reușită prin Google.");

    setTimeout(() => {
      navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
        replace: true,
      });
    }, 700);
  }, [navigate]);

  useEffect(() => {
    setIsSignUpMode(location.pathname === PATHS.AUTH.REGISTER);
  }, [location.pathname]);

  const handleGoogleAuth = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

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
      toast.success("Bine ai revenit.");
      setTimeout(() => {
        navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
          replace: true,
        });
      }, 700);
    } catch {
      toast.error("Email sau parolă incorecte.");
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
      toast.success("Cont creat. Te poți autentifica acum.");
      setTimeout(() => {
        setPassword("");
        navigate(PATHS.AUTH.LOGIN, { replace: true });
      }, 900);
    } catch {
      toast.error("Nu am putut crea contul.");
    }
  };

  return (
    <div
      className={`${styles.container} ${
        isSignUpMode ? styles["sign-up-mode"] : ""
      }`}
    >
      <Suspense
        fallback={<div className={styles.backgroundFallback} aria-hidden="true" />}
      >
        <ParticlesBackground />
      </Suspense>

      <div className={styles["forms-container"]}>
        <div className={styles["signin-signup"]}>
          <form
            className={`${styles.authForm} ${styles.signInForm}`}
            onSubmit={handleSignIn}
            noValidate
          >
            <h2 className={styles.title}>Conectare</h2>
            <p className={styles.subtitle}>
              Intră în cont pentru a continua analiza CV-urilor și a posturilor.
            </p>

            <div
              className={`${styles["input-field"]} ${
                errors.email ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                aria-invalid={errors.email}
              />

              <div className={styles["glow-bar"]} />
            </div>

            <div
              className={`${styles["input-field"]} ${
                errors.password ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                aria-invalid={errors.password}
              />

              <button
                type="button"
                className={styles["password-toggle"]}
                onClick={() => setShowPasswordSignIn((v) => !v)}
                aria-label={
                  showPasswordSignIn ? "Ascunde parola" : "Afișează parola"
                }
              >
                {showPasswordSignIn ? <EyeSlashIcon /> : <EyeIcon />}
              </button>

              <div className={styles["glow-bar"]} />
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles["btn-liquid"]}`}
            >
              Autentificare
            </button>

            <div className={styles["social-divider"]}>
              <span />
              <p>sau</p>
              <span />
            </div>

            <button
              type="button"
              className={styles["btn-social"]}
              onClick={handleGoogleAuth}
            >
              <GoogleIcon className={styles["google-icon"]} /> Google
            </button>

            <div className={styles["auth-switch"]}>
              <span>Nu ai cont?</span>
              <button
                type="button"
                onClick={() => navigate(PATHS.AUTH.REGISTER)}
              >
                Înregistrare
              </button>
            </div>
          </form>

          <form
            className={`${styles.authForm} ${styles.signUpForm}`}
            onSubmit={handleSignUp}
            noValidate
          >
            <h2 className={styles.title}>Înregistrare</h2>
            <p className={styles.subtitle}>
              Creează-ți contul și începe să gestionezi procesul de recrutare.
            </p>

            <div
              className={`${styles["input-field"]} ${
                errors.nume ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                autoComplete="given-name"
                autoCapitalize="words"
                aria-invalid={errors.nume}
              />

              <div className={styles["glow-bar"]} />
            </div>

            <div
              className={`${styles["input-field"]} ${
                errors.prenume ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                autoComplete="family-name"
                autoCapitalize="words"
                aria-invalid={errors.prenume}
              />

              <div className={styles["glow-bar"]} />
            </div>

            <div
              className={`${styles["input-field"]} ${
                errors.email ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                aria-invalid={errors.email}
              />

              <div className={styles["glow-bar"]} />
            </div>

            <div
              className={`${styles["input-field"]} ${
                errors.password ? styles.error : ""
              }`}
            >
              <div className={styles["icon-wrapper"]}>
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
                aria-invalid={errors.password}
              />

              <button
                type="button"
                className={styles["password-toggle"]}
                onClick={() => setShowPasswordSignUp((v) => !v)}
                aria-label={
                  showPasswordSignUp ? "Ascunde parola" : "Afișează parola"
                }
              >
                {showPasswordSignUp ? <EyeSlashIcon /> : <EyeIcon />}
              </button>

              <div className={styles["glow-bar"]} />
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles["btn-liquid"]}`}
            >
              Creează cont
            </button>

            <div className={styles["social-divider"]}>
              <span />
              <p>sau</p>
              <span />
            </div>

            <button
              type="button"
              className={styles["btn-social"]}
              onClick={handleGoogleAuth}
            >
              <GoogleIcon className={styles["google-icon"]} /> Google
            </button>

            <div className={styles["auth-switch"]}>
              <span>Ai deja cont?</span>
              <button type="button" onClick={() => navigate(PATHS.AUTH.LOGIN)}>
                Conectare
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaginaAuth;
