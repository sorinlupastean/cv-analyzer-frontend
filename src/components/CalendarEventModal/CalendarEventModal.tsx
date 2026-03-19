import React, { useEffect, useMemo, useState } from "react";
import styles from "./CalendarEventModal.module.css";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const TimesIcon = FaTimes as unknown as ComponentType<IconBaseProps>;

export type InterviewStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED";

export type EventForm = {
  id?: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  location: string;
  meetLink: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  status: InterviewStatus;
  cvId?: number | null;
};

export type FieldKey =
  | "title"
  | "candidateName"
  | "candidateEmail"
  | "date"
  | "startTime"
  | "endTime"
  | "meetLink";

export type FieldErrors = Partial<Record<FieldKey, string>>;

type Props = {
  isOpen: boolean;
  isEditing: boolean;
  form: EventForm;
  setForm: React.Dispatch<React.SetStateAction<EventForm>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;

  // erori venite din backend (fără toast)
  serverErrors?: FieldErrors;
  clearServerErrors?: () => void;

  // validări extra (ex: overlap cu alt eveniment)
  extraValidate?: (f: EventForm) => FieldErrors;

  // UX premium: buton disabled + text schimbat
  isSubmitting?: boolean;
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const isValidUrlOrEmpty = (s: string) => {
  const v = s.trim();
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

const CalendarEventModal: React.FC<Props> = ({
  isOpen,
  isEditing,
  form,
  setForm,
  onClose,
  onSubmit,
  serverErrors,
  clearServerErrors,
  extraValidate,
  isSubmitting,
}) => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const titleText = useMemo(
    () => (isEditing ? "Editează Programarea" : "Interviu Nou"),
    [isEditing],
  );

  // sincronizează erorile venite de la server în UI
  useEffect(() => {
    if (!isOpen) return;
    if (!serverErrors) return;
    if (Object.keys(serverErrors).length === 0) return;
    setErrors((prev) => ({ ...prev, ...serverErrors }));
  }, [serverErrors, isOpen]);

  // când se închide modalul, curăță erorile ca să nu rămână “lipite”
  useEffect(() => {
    if (!isOpen) setErrors({});
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (f: EventForm): FieldErrors => {
    const next: FieldErrors = {};

    if (!f.title.trim()) next.title = "Titlul este obligatoriu";
    if (!f.candidateName.trim()) next.candidateName = "Numele este obligatoriu";

    // Email obligatoriu + valid
    if (!f.candidateEmail.trim()) {
      next.candidateEmail = "Email-ul este obligatoriu";
    } else if (!isValidEmail(f.candidateEmail)) {
      next.candidateEmail = "Email invalid";
    }

    if (!f.date.trim()) next.date = "Data este obligatorie";
    if (!f.startTime.trim()) next.startTime = "Ora de start este obligatorie";
    if (!f.endTime.trim()) next.endTime = "Ora de final este obligatorie";

    // meetLink optional, dar dacă e completat trebuie să fie URL valid
    if (!isValidUrlOrEmpty(f.meetLink)) {
      next.meetLink = "Link invalid";
    }

    // interval + trecut
    if (f.date && f.startTime && f.endTime) {
      const start = new Date(`${f.date}T${f.startTime}:00`);
      const end = new Date(`${f.date}T${f.endTime}:00`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        next.startTime = next.startTime || "Oră invalidă";
        next.endTime = next.endTime || "Oră invalidă";
      } else {
        if (end.getTime() <= start.getTime()) {
          next.endTime = "Ora de final trebuie să fie după ora de start";
        }

        const now = new Date();
        if (start.getTime() < now.getTime()) {
          next.date = next.date || "Data este în trecut";
          next.startTime = next.startTime || "Ora de start este în trecut";
        }
      }
    }

    // validări extra (ex: overlap)
    if (extraValidate) {
      const extra = extraValidate(f);
      for (const [k, v] of Object.entries(extra)) {
        (next as any)[k] = v;
      }
    }

    return next;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // fără toast aici
    onSubmit(e);
  };

  const setField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));

    // curăță eroarea câmpului curent când userul editează
    setErrors((prev) => {
      if (!((key as any) in prev)) return prev;
      const copy = { ...prev };
      delete (copy as any)[key];
      return copy;
    });

    // curăță și erorile de server (să nu reapară după typing)
    clearServerErrors?.();
  };

  const fieldClass = (k: FieldKey) =>
    `${styles.fControl} ${errors[k] ? styles.inputError : ""}`;

  const labelClass = (k: FieldKey) => `${errors[k] ? styles.labelError : ""}`;

  const handleClose = () => {
    setErrors({});
    clearServerErrors?.();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div className={styles.modalIcon}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className={styles.modalHeaderTitle}>{titleText}</h3>
              <h4 className={styles.modalHeaderSubTitle}>
                Completează detaliile evenimentului
              </h4>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={handleClose}
            type="button"
            disabled={isSubmitting}
          >
            <TimesIcon size={14} />
          </button>
        </header>

        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.formGrid}>
            <div className={`${styles.fGroup} ${styles.full}`}>
              <label className={labelClass("title")}>Titlu Eveniment</label>
              <input
                className={fieldClass("title")}
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={
                  errors.title
                    ? errors.title
                    : "ex: Interviu Tehnic Senior React"
                }
                aria-invalid={Boolean(errors.title)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label>Status</label>
              <select
                className={styles.fControl}
                value={form.status}
                onChange={(e) =>
                  setField("status", e.target.value as InterviewStatus)
                }
                disabled={isSubmitting}
              >
                <option value="SCHEDULED">Programat</option>
                <option value="CONFIRMED">Confirmat</option>
                <option value="CANCELLED">Anulat</option>
              </select>
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("date")}>
                Data -{errors.date ? <div>{errors.date}</div> : null}
              </label>
              <input
                className={fieldClass("date")}
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                aria-invalid={Boolean(errors.date)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("candidateName")}>
                Nume Candidat
              </label>
              <input
                className={fieldClass("candidateName")}
                type="text"
                value={form.candidateName}
                onChange={(e) => setField("candidateName", e.target.value)}
                placeholder={
                  errors.candidateName ? errors.candidateName : "Nume Prenume"
                }
                aria-invalid={Boolean(errors.candidateName)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("candidateEmail")}>Email</label>
              <input
                className={fieldClass("candidateEmail")}
                type="email"
                value={form.candidateEmail}
                onChange={(e) => setField("candidateEmail", e.target.value)}
                placeholder={
                  errors.candidateEmail
                    ? errors.candidateEmail
                    : "candidat@email.com"
                }
                aria-invalid={Boolean(errors.candidateEmail)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("startTime")}>Ora Start</label>
              <input
                className={fieldClass("startTime")}
                type="time"
                value={form.startTime}
                onChange={(e) => setField("startTime", e.target.value)}
                aria-invalid={Boolean(errors.startTime)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("endTime")}>Ora Final</label>
              <input
                className={fieldClass("endTime")}
                type="time"
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)}
                aria-invalid={Boolean(errors.endTime)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label>Locație</label>
              <input
                className={styles.fControl}
                type="text"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Online / Sediu"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.fGroup}>
              <label className={labelClass("meetLink")}>Link Întâlnire</label>
              <input
                className={fieldClass("meetLink")}
                type="url"
                value={form.meetLink}
                onChange={(e) => setField("meetLink", e.target.value)}
                placeholder={
                  errors.meetLink
                    ? errors.meetLink
                    : "https://meet.google.com/..."
                }
                aria-invalid={Boolean(errors.meetLink)}
                disabled={isSubmitting}
              />
            </div>

            <div className={`${styles.fGroup} ${styles.full}`}>
              <label>Notițe</label>
              <textarea
                className={styles.fControl}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Detalii suplimentare, feedback..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Anulează
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Se salvează..."
                : isEditing
                  ? "Actualizează"
                  : "Creează Programare"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventModal;
