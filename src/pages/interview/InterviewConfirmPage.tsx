import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../api/http";
import styles from "./InterviewTokenPage.module.css";

type InterviewStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED";

type InterviewEventDto = {
  id: number;
  title: string;
  candidateName: string;
  candidateEmail: string;
  location?: string | null;
  notes?: string | null;
  startAt: string;
  endAt: string;
  status: InterviewStatus;
  meetLink?: string | null;
  cvId?: number | null;
};

const InterviewConfirmPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<"ok" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [event, setEvent] = useState<InterviewEventDto | null>(null);

  const toGoogleDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  };

  const buildGoogleCalendarUrl = (p: {
    title: string;
    startAt: string;
    endAt: string;
    details?: string;
    location?: string;
  }) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const text = encodeURIComponent(p.title || "Interviu");
    const dates = encodeURIComponent(
      `${toGoogleDate(p.startAt)}/${toGoogleDate(p.endAt)}`,
    );
    const details = encodeURIComponent(p.details || "");
    const location = encodeURIComponent(p.location || "");
    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  const googleCalendarUrl = useMemo(() => {
    if (!event) return null;
    return buildGoogleCalendarUrl({
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
      location: event.location || event.meetLink || "",
      details: event.meetLink ? `Link interviu: ${event.meetLink}` : "",
    });
  }, [event]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token.trim()) {
        setLoading(false);
        setDone("error");
        setMessage("Lipsește token-ul de confirmare.");
        return;
      }
      try {
        setLoading(true);
        const { data } = await http.post<InterviewEventDto>(
          "/interviews/confirm",
          { token },
        );
        if (cancelled) return;
        setEvent(data);
        setDone("ok");
        setMessage("Programarea a fost confirmată. Ne vedem curând!");
        toast.success("Confirmare reușită");
      } catch (err: any) {
        if (cancelled) return;
        setDone("error");
        setMessage(
          err?.response?.data?.message ||
            "Nu am putut confirma programarea. Token-ul poate fi expirat.",
        );
        toast.error("Confirmarea a eșuat");
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
        <div
          className={`${styles.iconCircle} ${done === "error" ? styles.iconDanger : ""}`}
        >
          {loading ? "..." : done === "ok" ? "✓" : "!"}
        </div>

        <h1 className={styles.title}>Confirmare Interviu</h1>

        {loading ? (
          <div style={{ padding: "20px" }}>
            <div className={styles.loader}></div>
            <p className={styles.textMuted}>Validăm detaliile programării...</p>
          </div>
        ) : (
          <>
            <p className={done === "ok" ? styles.textOk : styles.textDanger}>
              {message}
            </p>

            <div className={styles.actions}>
              {done === "ok" && googleCalendarUrl && (
                <a
                  className={styles.primaryBtn}
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Adaugă în Google Calendar
                </a>
              )}
              <button
                className={styles.secondaryBtn}
                onClick={() => window.close()}
              >
                Închide Fereastra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewConfirmPage;
