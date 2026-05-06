import React from "react";
import toast, { resolveValue, ToastBar, Toaster } from "react-hot-toast";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import styles from "./AppToaster.module.css";

const variantLabel: Record<string, string> = {
  success: "Succes",
  error: "Eroare",
  loading: "Se încarcă",
  blank: "Notificare",
  custom: "Notificare",
};

const AppToaster: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      toastOptions={{
        duration: 4200,
        success: { duration: 3600 },
        error: { duration: 4800 },
        loading: { duration: Infinity },
      }}
    >
      {(t) => {
        const label = variantLabel[t.type] ?? "Notificare";

        return (
          <ToastBar
            toast={t}
            style={{
              background: "transparent",
              boxShadow: "none",
              padding: 0,
            }}
          >
            {() => (
              <div
                className={[
                  styles.toast,
                  t.type === "success" ? styles.success : "",
                  t.type === "error" ? styles.error : "",
                  t.type === "loading" ? styles.loading : "",
                ].join(" ")}
              >
                <span className={styles.accent} aria-hidden="true" />

                <span className={styles.icon} aria-hidden="true">
                  {t.type === "success" ? (
                    <FaCheckCircle />
                  ) : t.type === "error" ? (
                    <FaExclamationCircle />
                  ) : t.type === "loading" ? (
                    <FaSpinner className={styles.spin} />
                  ) : (
                    <FaInfoCircle />
                  )}
                </span>

                <div className={styles.content}>
                  <span className={styles.label}>{label}</span>
                  <div className={styles.message}>{resolveValue(t.message, t)}</div>
                </div>

                {t.type !== "loading" && (
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Închide notificarea"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
};

export default AppToaster;
