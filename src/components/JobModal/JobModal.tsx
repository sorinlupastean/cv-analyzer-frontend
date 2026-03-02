import React, { useEffect, useMemo, useState } from "react";
import styles from "../CalendarEventModal/CalendarEventModal.module.css"; // Folosim CSS-ul de la Calendar pentru consistență 1:1
import { FaBriefcase, FaTimes } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";
import type { JobStatus } from "../../api/jobs.service";

const BriefcaseIcon = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const TimesIcon = FaTimes as unknown as ComponentType<IconBaseProps>;

export type JobForm = {
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: JobStatus;
};

type Props = {
  isOpen: boolean;
  isEditing: boolean;
  form: JobForm;
  setForm: React.Dispatch<React.SetStateAction<JobForm>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
};

const JobModal: React.FC<Props> = ({
  isOpen,
  isEditing,
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const titleText = useMemo(
    () => (isEditing ? "Editare Post" : "Creează Post Nou"),
    [isEditing],
  );

  if (!isOpen) return null;

  const setField = <K extends keyof JobForm>(key: K, value: JobForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div className={styles.modalIcon}>
              <BriefcaseIcon size={18} />
            </div>
            <div>
              <h3 className={styles.modalHeaderTitle}>{titleText}</h3>
              <h4 className={styles.modalHeaderSubTitle}>
                Completează detaliile postului vacant
              </h4>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          >
            <TimesIcon size={14} />
          </button>
        </header>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Titlu Poziție</label>
              <input
                className={styles.fControl}
                type="text"
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Ex: Senior Frontend Developer"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label>Categorie</label>
              <input
                className={styles.fControl}
                type="text"
                required
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="Ex: IT / Software"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label>Tip Contract</label>
              <select
                className={styles.fControl}
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Locație</label>
              <input
                className={styles.fControl}
                type="text"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Ex: București / Remote"
                disabled={isSubmitting}
              />
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Descriere Post</label>
              <textarea
                className={styles.fControl}
                required
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Detalii despre responsabilități..."
                disabled={isSubmitting}
              />
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Cerințe</label>
              <textarea
                className={styles.fControl}
                required
                value={form.requirements}
                onChange={(e) => setField("requirements", e.target.value)}
                placeholder="Ex: comunicare, lucru în echipă, experiență relevantă..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Anulează
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Se salvează..." : "Salvează Postul"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
