import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PATHS } from "../../routs/paths";
import styles from "./PaginaAuth.module.css";

import {
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

import {
  getAuthErrorMessage,
  login,
  register,
} from "../../api/auth.service";

type ParticleStyle = React.CSSProperties & {
  "--x"?: string;
  "--y"?: string;
  "--dx"?: string;
  "--dy"?: string;
  "--duration"?: string;
  "--delay"?: string;
  "--size"?: string;
};

const AUTH_PARTICLES: ParticleStyle[] = [
  { "--x": "7%", "--y": "16%", "--dx": "5vw", "--dy": "-7vh", "--duration": "22s", "--delay": "0s", "--size": "9px" },
  { "--x": "15%", "--y": "74%", "--dx": "4vw", "--dy": "-10vh", "--duration": "28s", "--delay": "-6s", "--size": "6px" },
  { "--x": "24%", "--y": "24%", "--dx": "8vw", "--dy": "-9vh", "--duration": "24s", "--delay": "-3s", "--size": "11px" },
  { "--x": "31%", "--y": "67%", "--dx": "5vw", "--dy": "-8vh", "--duration": "26s", "--delay": "-11s", "--size": "7px" },
  { "--x": "43%", "--y": "17%", "--dx": "6vw", "--dy": "-6vh", "--duration": "30s", "--delay": "-8s", "--size": "6px" },
  { "--x": "56%", "--y": "80%", "--dx": "7vw", "--dy": "-9vh", "--duration": "25s", "--delay": "-5s", "--size": "10px" },
  { "--x": "64%", "--y": "29%", "--dx": "4vw", "--dy": "-7vh", "--duration": "23s", "--delay": "-9s", "--size": "6px" },
  { "--x": "73%", "--y": "71%", "--dx": "5vw", "--dy": "-11vh", "--duration": "27s", "--delay": "-1s", "--size": "8px" },
  { "--x": "82%", "--y": "22%", "--dx": "4vw", "--dy": "-8vh", "--duration": "29s", "--delay": "-12s", "--size": "7px" },
  { "--x": "90%", "--y": "76%", "--dx": "3vw", "--dy": "-9vh", "--duration": "21s", "--delay": "-4s", "--size": "6px" },
  { "--x": "48%", "--y": "47%", "--dx": "2vw", "--dy": "-4vh", "--duration": "34s", "--delay": "-10s", "--size": "5px" },
  { "--x": "60%", "--y": "40%", "--dx": "3vw", "--dy": "-5vh", "--duration": "31s", "--delay": "-15s", "--size": "5px" },
];

const ArrowRight = FaArrowRight as unknown as ComponentType<IconBaseProps>;
const UserIcon = FaUser as unknown as ComponentType<IconBaseProps>;
const EnvelopeIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const LockIcon = FaLock as unknown as ComponentType<IconBaseProps>;
const GoogleIcon = FaGoogle as unknown as ComponentType<IconBaseProps>;
const EyeIcon = FaEye as unknown as ComponentType<IconBaseProps>;
const EyeSlashIcon = FaEyeSlash as unknown as ComponentType<IconBaseProps>;

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_AUTH_URL = API_URL ? `${API_URL}/auth/google` : "/auth/google";

const PaginaAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpMode = location.pathname === PATHS.AUTH.REGISTER;

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
    const error = params.get("error");

    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.error(error);

      if (window.location.pathname !== PATHS.AUTH.LOGIN) {
        navigate(PATHS.AUTH.LOGIN, { replace: true });
      }

      return;
    }

    if (!token) {
      return;
    }

    localStorage.setItem("access_token", token);
    window.dispatchEvent(new Event("auth-change"));
    window.history.replaceState({}, document.title, window.location.pathname);
    toast.success("Conectare reușită prin Google.");

    setTimeout(() => {
      navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
        replace: true,
      });
    }, 700);
  }, [navigate]);

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
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Bine ai revenit.");
      setTimeout(() => {
        navigate(`${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.HOME}`, {
          replace: true,
        });
      }, 700);
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "Email sau parolă incorecte."),
      );
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
        navigate(PATHS.AUTH.LOGIN);
      }, 900);
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "Nu am putut crea contul."),
      );
    }
  };

  const title = isSignUpMode ? "Înregistrare" : "Autentificare";
  const subtitle = isSignUpMode
    ? "Creează-ți contul și începe să gestionezi procesul de recrutare."
    : "Intră în cont pentru a continua gestionarea CV-urilor și posturilor.";

  return (
    <div className={styles.container}>
      <div className={styles.ambientLayer} aria-hidden="true">
        <span className={styles.ambientOrbOne} />
        <span className={styles.ambientOrbTwo} />
        <span className={styles.ambientOrbThree} />
      </div>

      <div className={styles.particles} aria-hidden="true">
        {AUTH_PARTICLES.map((particle, index) => (
          <span
            key={index}
            className={styles.particle}
            style={particle}
            aria-hidden="true"
          />
        ))}
      </div>

      <header className={styles.header}>
        <Link to={PATHS.ROOT} className={styles.brand} aria-label="CV-Analyzer Studio">
          <span className={styles.brandMark}>CV</span>
          <div className={styles.brandText}>
            <span className={styles.brandName}>CV-Analyzer Studio</span>
            <span className={styles.brandTag}>Recruitment intelligence</span>
          </div>
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.centerWrap}>
          <div
            className={`${styles.formCard} ${
              isSignUpMode ? styles.formCardWide : ""
            }`}
          >
            <span className={styles.badge}>Acces securizat</span>
            <h1>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>

            {!isSignUpMode ? (
              <form className={styles.form} onSubmit={handleSignIn} noValidate>
                <div className={styles.field} data-invalid={errors.email ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <EnvelopeIcon />
                  </span>
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
                </div>

                <div className={styles.field} data-invalid={errors.password ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <LockIcon />
                  </span>
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
                    className={styles.passwordToggle}
                    onClick={() => setShowPasswordSignIn((v) => !v)}
                    aria-label={showPasswordSignIn ? "Ascunde parola" : "Afișează parola"}
                  >
                    {showPasswordSignIn ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>

                <button type="submit" className={styles.primaryAction}>
                  Autentificare
                  <ArrowRight />
                </button>

                <div className={styles.divider}>
                  <span />
                  <p>sau</p>
                  <span />
                </div>

                <button type="button" className={styles.secondaryAction} onClick={handleGoogleAuth}>
                  <GoogleIcon className={styles.googleIcon} />
                  Google
                </button>

                <button
                  type="button"
                  className={styles.switchAction}
                  onClick={() => navigate(PATHS.AUTH.REGISTER)}
                >
                  Nu ai cont? Înregistrare
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleSignUp} noValidate>
                <div className={styles.field} data-invalid={errors.nume ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <UserIcon />
                  </span>
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
                </div>

                <div className={styles.field} data-invalid={errors.prenume ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <UserIcon />
                  </span>
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
                </div>

                <div className={styles.field} data-invalid={errors.email ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <EnvelopeIcon />
                  </span>
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
                </div>

                <div className={styles.field} data-invalid={errors.password ? "true" : "false"}>
                  <span className={styles.fieldIcon}>
                    <LockIcon />
                  </span>
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
                    className={styles.passwordToggle}
                    onClick={() => setShowPasswordSignUp((v) => !v)}
                    aria-label={showPasswordSignUp ? "Ascunde parola" : "Afișează parola"}
                  >
                    {showPasswordSignUp ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>

                <button type="submit" className={styles.primaryAction}>
                  Creează cont
                  <ArrowRight />
                </button>

                <div className={styles.divider}>
                  <span />
                  <p>sau</p>
                  <span />
                </div>

                <button type="button" className={styles.secondaryAction} onClick={handleGoogleAuth}>
                  <GoogleIcon className={styles.googleIcon} />
                  Google
                </button>

                <button
                  type="button"
                  className={styles.switchAction}
                  onClick={() => navigate(PATHS.AUTH.LOGIN)}
                >
                  Ai deja cont? Autentificare
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PaginaAuth;
