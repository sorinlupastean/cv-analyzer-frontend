import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import styles from "./CVDetailsPage.module.css";

import UserIcon from "../../assets/user-animated.svg";
import CalendarIcon from "../../assets/calendar-animated.svg";
import EmailIcon from "../../assets/email.svg";
import PhoneIcon from "../../assets/phone.svg";
import Briefcase from "../../assets/briefcase.svg";
import SchoolIcon from "../../assets/school.svg";
import AwardIcon from "../../assets/award.svg";

import { useNavigate, useParams, useLocation } from "react-router-dom";

const CVDetailsPage: React.FC = () => {
  const pdfUrl = "/sample.pdf"; // aici pui tu PDF-ul real
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <DashboardLayout pageTitle="Detalii candidat">
      <div className={styles.pageWrapper}>
        {/* Back button */}
        <button
          className={styles.backButton}
          onClick={() => {
            if (location.state?.fromResults && location.state?.jobId) {
              navigate("/dashboard/results", {
                state: { openJobId: location.state.jobId },
              });
            } else {
              navigate(-1);
            }
          }}
        >
          Înapoi la rezultate
        </button>

        {/* GRID PRINCIPAL */}
        <div className={styles.grid}>
          {/* CARD STANGA */}
          <div className={styles.leftCard}>
            <h2 className={styles.sectionTitle}>Scor potrivire</h2>

            <div className={styles.scoreNumber}>85%</div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "85%" }}
              ></div>
            </div>

            <p className={styles.scoreLabel}>Potrivire foarte bună</p>

            <hr className={styles.divider} />

            <h3 className={styles.subsectionTitle}>Informații fișier</h3>

            <div className={styles.infoRow}>
              <span>Nume fișier:</span>
              <strong>CV_Maria_Ionescu.pdf</strong>
            </div>

            <div className={styles.infoRow}>
              <span>Data upload:</span>
              <strong>14.01.2025</strong>
            </div>

            <div className={styles.infoRow}>
              <span>Status:</span>
              <span className={styles.statusBadge}>Analizat</span>
            </div>
          </div>

          {/* CARD DREAPTA */}
          <div className={styles.rightColumn}>
            {/* Informații candidat */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>
                <img src={UserIcon} alt="" />
                Informații candidat
              </h2>

              <p className={styles.name}>Maria Ionescu</p>

              <div className={styles.detailRow}>
                <img src={EmailIcon} alt="" />
                maria.ionescu@email.com
              </div>

              <div className={styles.detailRow}>
                <img src={PhoneIcon} alt="" />
                +40 733 234 567
              </div>
            </div>

            {/* Experiență */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>
                <img src={Briefcase} alt="" />
                Experiență profesională
              </h2>

              <p>3 ani experiență ca Full Stack Developer</p>
            </div>

            {/* Educație */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>
                <img src={SchoolIcon} alt="" />
                Educație
              </h2>

              <p>Universitatea Politehnica București</p>
            </div>

            {/* Skills */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>
                <img src={AwardIcon} alt="" />
                Competențe tehnice
              </h2>

              <div className={styles.skillsList}>
                <span className={styles.skillTag}>Vue.js</span>
                <span className={styles.skillTag}>Python</span>
                <span className={styles.skillTag}>Django</span>
                <span className={styles.skillTag}>MySQL</span>
                <span className={styles.skillTag}>AWS</span>
              </div>
            </div>

            {/* Analiză automată */}
            <div className={styles.analysisCard}>
              <h2 className={styles.analysisTitle}>Analiză automată</h2>

              <ul className={styles.checkList}>
                <li>Experiența corespunde cerințelor jobului</li>
                <li>Competențe relevante pentru poziție</li>
                <li>Educația este potrivită</li>
                <li>Recomandare: Invită candidatul la interviu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PDF VIEWER */}
        <div className={styles.pdfWrapper}>
          <h2 className={styles.pdfTitle}>Document PDF</h2>
          <iframe
            src={pdfUrl}
            className={styles.pdfViewer}
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVDetailsPage;
