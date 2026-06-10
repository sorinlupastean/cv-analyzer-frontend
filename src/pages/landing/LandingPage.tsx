import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { PATHS } from "../../routs/paths";

import {
  FaArrowRight,
  FaBriefcase,
  FaCloudUploadAlt,
  FaClipboardList,
  FaChartLine,
  FaCheckCircle,
  FaFileAlt,
  FaRobot,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const ArrowRight = FaArrowRight as unknown as ComponentType<IconBaseProps>;
const Briefcase = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const CloudUploadAlt =
  FaCloudUploadAlt as unknown as ComponentType<IconBaseProps>;
const ClipboardList = FaClipboardList as unknown as ComponentType<IconBaseProps>;
const ChartLine = FaChartLine as unknown as ComponentType<IconBaseProps>;
const CheckCircle = FaCheckCircle as unknown as ComponentType<IconBaseProps>;
const FileAlt = FaFileAlt as unknown as ComponentType<IconBaseProps>;
const Robot = FaRobot as unknown as ComponentType<IconBaseProps>;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const benefitsRef = useRef<HTMLElement | null>(null);

  const scrollToBenefits = () => {
    benefitsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} aria-hidden="true" />
      <div className={styles.backgroundGlowAlt} aria-hidden="true" />

      <header className={styles.header}>
        <Link
          to={PATHS.ROOT}
          className={styles.brand}
          aria-label="CV-Analyzer Studio"
        >
          <span className={styles.brandMark}>CV</span>
          <div className={styles.brandText}>
            <span className={styles.brandName}>CV-Analyzer Studio</span>
            <span className={styles.brandTag}>Recruitment intelligence</span>
          </div>
        </Link>

        <nav className={styles.headerActions} aria-label="Autentificare și cont">
          <Link to={PATHS.AUTH.LOGIN} className={styles.ghostButton}>
            Autentificare
          </Link>
          <Link to={PATHS.AUTH.REGISTER} className={styles.primaryButton}>
            Înregistrare
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>Platformă pentru recrutare modernă</span>
            <h1>
              Analiză inteligentă a CV-urilor pentru recrutare eficientă
            </h1>
            <p className={styles.heroText}>
              CV-Analyzer Studio ajută recrutorii să organizeze posturi, să
              centralizeze CV-uri și să evalueze rapid compatibilitatea
              candidaților cu cerințele fiecărui rol.
            </p>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryCta}
                onClick={() => navigate(PATHS.AUTH.LOGIN)}
              >
                Intră în aplicație
                <ArrowRight />
              </button>

              <button
                type="button"
                className={styles.secondaryCta}
                onClick={scrollToBenefits}
              >
                Vezi funcționalitățile
              </button>
            </div>

            <div className={styles.heroIndicators} aria-label="Indicatori cheie">
              <div className={styles.indicatorPill}>
                <Robot />
                <span>Analiză automată CV-uri</span>
              </div>
              <div className={styles.indicatorPill}>
                <ChartLine />
                <span>Scor de compatibilitate</span>
              </div>
              <div className={styles.indicatorPill}>
                <Briefcase />
                <span>Organizare pe posturi</span>
              </div>
            </div>

            <div className={styles.heroStats} aria-label="Rezumat aplicație">
              <div className={styles.statCard}>
                <FileAlt />
                <div>
                  <strong>Evaluare rapidă</strong>
                  <span>pentru fiecare candidat</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <ClipboardList />
                <div>
                  <strong>Posturi organizate</strong>
                  <span>cu vizualizare clară</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <CloudUploadAlt />
                <div>
                  <strong>Upload simplu</strong>
                  <span>pentru fișiere PDF și DOCX</span>
                </div>
              </div>
            </div>
          </div>

          <aside
            className={styles.mockupPanel}
            aria-label="Mockup rezultat analiză CV"
          >
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <div>
                  <span className={styles.mockupEyebrow}>Analiză candidat</span>
                  <h2>Frontend Developer</h2>
                </div>
                <span className={styles.matchBadge}>87%</span>
              </div>

              <div className={styles.scoreBlock}>
                <div className={styles.scoreMeta}>
                  <span>Compatibilitate</span>
                  <strong>87%</strong>
                </div>
                <div className={styles.scoreTrack}>
                  <div className={styles.scoreFill} />
                </div>
              </div>

              <div className={styles.ratingList}>
                <div className={styles.ratingRow}>
                  <span>Competențe tehnice</span>
                  <strong>92%</strong>
                </div>
                <div className={styles.ratingRow}>
                  <span>Experiență relevantă</span>
                  <strong>84%</strong>
                </div>
                <div className={styles.ratingRow}>
                  <span>Potrivire cerințe job</span>
                  <strong>87%</strong>
                </div>
              </div>

              <div className={styles.skillBlock}>
                <span>Competențe identificate</span>
                <div className={styles.skillList}>
                  <span>React</span>
                  <span>Node.js</span>
                  <span>SQL</span>
                  <span>Git</span>
                </div>
              </div>

              <div className={styles.statusRow}>
                <CheckCircle />
                <div>
                  <strong>Status</strong>
                  <span>Recomandat pentru etapa următoare</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section ref={benefitsRef} className={styles.benefitsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Funcționalități principale</span>
            <h2>
              Instrumente gândite pentru un flux de recrutare mai clar, mai rapid
              și mai ușor de urmărit.
            </h2>
          </div>

          <div className={styles.benefitsGrid}>
            <article className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <ClipboardList />
              </div>
              <h3>Gestionarea posturilor</h3>
              <p>
                Creezi și organizezi rolurile disponibile într-o structură clară.
              </p>
            </article>

            <article className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <CloudUploadAlt />
              </div>
              <h3>Încărcarea CV-urilor</h3>
              <p>
                Adaugi documente PDF sau DOCX pentru fiecare post.
              </p>
            </article>

            <article className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <Robot />
              </div>
              <h3>Analiză automată</h3>
              <p>
                Primești scoruri și observații relevante pentru fiecare candidat.
              </p>
            </article>

            <article className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <ChartLine />
              </div>
              <h3>Rezultate centralizate</h3>
              <p>
                Compari candidații mai ușor și urmărești statusul evaluărilor.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutCopy}>
              <span className={styles.kicker}>De ce CV-Analyzer Studio?</span>
              <h2>O interfață construită pentru recrutori care vor claritate.</h2>
              <p>
                Aplicația a fost dezvoltată pentru a sprijini recrutorii în procesul de
                selecție, prin centralizarea posturilor, încărcarea CV-urilor și
                analizarea automată a compatibilității dintre candidați și cerințele
                rolului.
              </p>
            </div>

            <div className={styles.aboutListCard}>
              <ul>
                <li>Reducerea timpului de analiză manuală</li>
                <li>Evaluare mai clară a candidaților</li>
                <li>Flux de lucru organizat pentru recrutori</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalCtaCard}>
            <div>
              <span className={styles.kicker}>Pasul următor</span>
              <h2>Pregătit pentru analiza CV-urilor?</h2>
              <p>
                Autentifică-te și continuă gestionarea procesului de recrutare într-un
                mod mai clar și mai eficient.
              </p>
            </div>

            <button
              type="button"
              className={styles.finalButton}
              onClick={() => navigate(PATHS.AUTH.LOGIN)}
            >
              Autentificare în aplicație
              <ArrowRight />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
