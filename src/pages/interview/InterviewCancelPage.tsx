import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../api/http";
import { PATHS } from "../../routs/paths";
import styles from "./InterviewTokenPage.module.css";

const InterviewCancelPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const calendarPath = useMemo(
    () => `${PATHS.DASHBOARD.ROOT}/${PATHS.DASHBOARD.CALENDAR}`,
    [],
  );

  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<"ok" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token.trim()) {
        setLoading(false);
        setDone("error");
        setMessage("Lipsește token-ul de anulare.");
        return;
      }
      try {
        setLoading(true);
        await http.post("/interviews/cancel", { token });
        if (cancelled) return;
        setDone("ok");
        setMessage("Interviul a fost anulat. Echipa a fost notificată.");
        toast.success("Anulare reușită");
      } catch (err: any) {
        if (cancelled) return;
        setDone("error");
        setMessage(
          err?.response?.data?.message || "Nu am putut anula programarea.",
        );
        toast.error("Anularea a eșuat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.iconCircle} ${styles.iconDanger}`}>
          {loading ? "..." : "✕"}
        </div>

        <h1 className={styles.title}>Anulare Interviu</h1>

        {loading ? (
          <div style={{ padding: "20px" }}>
            <div className={styles.loader}></div>
            <p className={styles.textMuted}>Se procesează solicitarea...</p>
          </div>
        ) : (
          <>
            <p className={done === "ok" ? styles.textOk : styles.textDanger}>
              {message}
            </p>

            <div className={styles.actions}>
              <button
                className={styles.ghostBtn}
                onClick={() => window.close()}
              >
                Închide
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewCancelPage;
