import React from "react";
import styles from "../CalendarEventModal/CalendarEventModal.module.css"; // Refolosim stilurile pentru consistență 1:1
import { FaEnvelope, FaTimes } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const EnvelopeIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const TimesIcon = FaTimes as unknown as ComponentType<IconBaseProps>;

export type EmailDraft = {
  to: string;
  subject: string;
  body: string;
};

type Props = {
  isOpen: boolean;
  draft: EmailDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmailDraft>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
};

const EmailCandidateModal: React.FC<Props> = ({
  isOpen,
  draft,
  setDraft,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const setField = (key: keyof EmailDraft, value: string) => {
    setDraft((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div className={styles.modalIcon}>
              <EnvelopeIcon size={18} />
            </div>
            <div>
              <h3 className={styles.modalHeaderTitle}>Trimite Email</h3>
              <h4 className={styles.modalHeaderSubTitle}>
                Mesaj precompletat pentru candidat
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
              <label>Destinatar (Email)</label>
              <input
                className={styles.fControl}
                type="email"
                value={draft.to}
                onChange={(e) => setField("to", e.target.value)}
                placeholder="email@candidat.com"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Subiect</label>
              <input
                className={styles.fControl}
                type="text"
                value={draft.subject}
                onChange={(e) => setField("subject", e.target.value)}
                placeholder="Subiectul mesajului"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Mesaj</label>
              <textarea
                className={styles.fControl}
                rows={8}
                value={draft.body}
                onChange={(e) => setField("body", e.target.value)}
                placeholder="Conținutul email-ului..."
                disabled={isSubmitting}
                style={{ minHeight: "180px" }} // Puțin mai mare pentru corpul email-ului
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
              {isSubmitting ? "Se trimite..." : "Trimite email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCandidateModal;
