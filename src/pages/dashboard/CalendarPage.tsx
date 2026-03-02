import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./CalendarPage.module.css";
import toast, { Toaster } from "react-hot-toast";
import CalendarEventModal from "../../components/CalendarEventModal/CalendarEventModal";
import {
  interviewsApi,
  type InterviewEventDto,
} from "../../api/interviews.service";

import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaSearch,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaLink,
  FaCheckCircle,
  FaBan,
  FaRegCalendarCheck,
  FaEdit,
  FaTrash,
  FaRegCopy,
} from "react-icons/fa";
import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const CalendarIcon = FaCalendarAlt as unknown as ComponentType<IconBaseProps>;
const ChevronLeft = FaChevronLeft as unknown as ComponentType<IconBaseProps>;
const ChevronRight = FaChevronRight as unknown as ComponentType<IconBaseProps>;
const Plus = FaPlus as unknown as ComponentType<IconBaseProps>;
const SearchIcon = FaSearch as unknown as ComponentType<IconBaseProps>;
const ClockIcon = FaClock as unknown as ComponentType<IconBaseProps>;
const UserIcon = FaUser as unknown as ComponentType<IconBaseProps>;
const MarkerIcon = FaMapMarkerAlt as unknown as ComponentType<IconBaseProps>;
const LinkIcon = FaLink as unknown as ComponentType<IconBaseProps>;
const OkIcon = FaCheckCircle as unknown as ComponentType<IconBaseProps>;
const WarnIcon = FaBan as unknown as ComponentType<IconBaseProps>;
const PlanIcon = FaRegCalendarCheck as unknown as ComponentType<IconBaseProps>;
const EditIcon = FaEdit as unknown as ComponentType<IconBaseProps>;
const TrashIcon = FaTrash as unknown as ComponentType<IconBaseProps>;
const CopyIcon = FaRegCopy as unknown as ComponentType<IconBaseProps>;

type InterviewStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED";

type InterviewEvent = {
  id: string; // păstrăm string în UI (din backend vine number)
  title: string;
  candidateName: string;
  candidateEmail?: string;
  location?: string;
  notes?: string;
  startAt: string;
  endAt: string;
  status: InterviewStatus;
  meetLink?: string;
  cvId?: number | null;
};

type EventForm = {
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

type HoverTipState = {
  open: boolean;
  key: string | null;
  dayLabel: string;
  items: InterviewEvent[];
  idx: number;
  pos: { top: number; left: number };
  side: "left" | "right";
  maxH: number;
  anchor: { top: number; bottom: number; left: number; right: number } | null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfWeekMonday = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatHumanDate = (d: Date) =>
  d.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatHour = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidUrl = (s: string) => {
  if (!s.trim()) return true;
  try {
    new URL(s.trim());
    return true;
  } catch {
    return false;
  }
};
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const mapDtoToUi = (x: InterviewEventDto): InterviewEvent => ({
  id: String(x.id),
  title: x.title,
  candidateName: x.candidateName,
  candidateEmail: x.candidateEmail || undefined,
  location: x.location ?? undefined,
  notes: x.notes ?? undefined,
  startAt: x.startAt,
  endAt: x.endAt,
  status: x.status,
  meetLink: x.meetLink ?? undefined,
  cvId: x.cvId ?? null,
});

const CalendarPage: React.FC = () => {
  const [cursor, setCursor] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });

  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InterviewStatus>(
    "ALL",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedKey = useMemo(() => toYMD(selectedDay), [selectedDay]);

  const emptyForm = useMemo(
    (): EventForm => ({
      title: "Interviu",
      candidateName: "",
      candidateEmail: "",
      location: "Online (Google Meet)",
      meetLink: "",
      notes: "",
      date: selectedKey,
      startTime: "10:00",
      endTime: "10:30",
      status: "SCHEDULED",
      cvId: null,
    }),
    [selectedKey],
  );

  const [form, setForm] = useState<EventForm>(emptyForm);

  useEffect(() => {
    if (!isModalOpen) {
      setForm(emptyForm);
      setEditingId(null);
    }
  }, [emptyForm, isModalOpen]);

  const monthLabel = useMemo(() => {
    return cursor.toLocaleDateString("ro-RO", {
      month: "long",
      year: "numeric",
    });
  }, [cursor]);

  const calendarDays = useMemo(() => {
    const mStart = startOfMonth(cursor);
    const mEnd = endOfMonth(cursor);
    const gridStart = startOfWeekMonday(mStart);
    const gridEnd = addDays(startOfWeekMonday(addDays(mEnd, 6)), 6);
    const days: Date[] = [];
    let cur = new Date(gridStart);
    while (cur <= gridEnd) {
      days.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return days;
  }, [cursor]);

  const visibleRange = useMemo(() => {
    const mStart = startOfMonth(cursor);
    const mEnd = endOfMonth(cursor);

    // intervalul complet vizibil în grid (include zilele din luna precedentă/următoare)
    const gridStart = startOfWeekMonday(mStart);
    const gridEnd = addDays(startOfWeekMonday(addDays(mEnd, 6)), 6);

    const from = new Date(gridStart);
    from.setHours(0, 0, 0, 0);

    const to = new Date(gridEnd);
    to.setHours(23, 59, 59, 999);

    return { from: from.toISOString(), to: to.toISOString() };
  }, [cursor]);

  // Load events for month
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingEvents(true);
        const data = await interviewsApi.list(
          visibleRange.from,
          visibleRange.to,
        );
        if (cancelled) return;
        setEvents(data.map(mapDtoToUi));
      } catch (err: any) {
        if (!cancelled) {
          toast.error(
            err?.response?.data?.message || "Nu pot încărca programările.",
          );
        }
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visibleRange.from, visibleRange.to]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (!q) return true;
      const hay =
        `${e.title} ${e.candidateName} ${e.candidateEmail || ""} ${e.location || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [events, query, statusFilter]);

  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, InterviewEvent[]>();
    for (const e of filteredEvents) {
      const d = new Date(e.startAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = toYMD(d);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }

    for (const [k, arr] of Array.from(map.entries())) {
      arr.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
      map.set(k, arr);
    }

    return map;
  }, [filteredEvents]);

  const agendaEvents = useMemo(
    () => eventsByDayKey.get(selectedKey) ?? [],
    [eventsByDayKey, selectedKey],
  );

  const openCreate = () => {
    setModalServerErrors({});
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (ev: InterviewEvent) => {
    setModalServerErrors({});
    const s = new Date(ev.startAt);
    const e = new Date(ev.endAt);

    setEditingId(ev.id);
    setForm({
      id: ev.id,
      title: ev.title,
      candidateName: ev.candidateName,
      candidateEmail: ev.candidateEmail || "",
      location: ev.location || "",
      meetLink: ev.meetLink || "",
      notes: ev.notes || "",
      date: toYMD(s),
      startTime: `${pad2(s.getHours())}:${pad2(s.getMinutes())}`,
      endTime: `${pad2(e.getHours())}:${pad2(e.getMinutes())}`,
      status: ev.status,
      cvId: ev.cvId ?? null,
    });

    setIsModalOpen(true);
  };

  const validateAndBuildIso = (f: EventForm) => {
    const title = f.title.trim();
    const candidateName = f.candidateName.trim();

    if (!title) return { ok: false as const, message: "Completează titlul." };
    if (!candidateName)
      return {
        ok: false as const,
        message: "Completează numele candidatului.",
      };

    const start = new Date(`${f.date}T${f.startTime}:00`);
    const end = new Date(`${f.date}T${f.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { ok: false as const, message: "Dată sau oră invalidă." };
    }
    if (end.getTime() <= start.getTime()) {
      return {
        ok: false as const,
        message: "Ora de final trebuie să fie după ora de start.",
      };
    }

    const email = f.candidateEmail.trim();
    const meet = f.meetLink.trim();

    return {
      ok: true as const,
      payload: {
        title,
        cvId: f.cvId ?? null,
        candidateName,
        candidateEmail: email || undefined, // IMPORTANT
        location: f.location.trim() || undefined,
        meetLink: meet || undefined,
        notes: f.notes.trim() || undefined,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        status: f.status,
      },
    };
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateAndBuildIso(form);

    if (!res.ok) return;

    try {
      toast.loading("Salvez...", { id: "saveEvent" });

      if (editingId) {
        const updated = await interviewsApi.update(
          Number(editingId),
          res.payload as any,
        );

        setEvents((prev) =>
          prev.map((x) =>
            x.id === editingId
              ? {
                  ...x,
                  ...mapDtoToUi(updated),
                }
              : x,
          ),
        );

        toast.success("Programarea a fost actualizată", { id: "saveEvent" });
      } else {
        const created = await interviewsApi.create(res.payload as any);

        setEvents((prev) => [mapDtoToUi(created), ...prev]);

        toast.success("Programare creată, email trimis candidatului", {
          id: "saveEvent",
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const mapped = mapApiValidationToFieldErrors(err);

      if (hasFieldErrors(mapped)) {
        // nu toast, doar inline în modal
        setModalServerErrors(mapped);
        toast.dismiss("saveEvent");
        return;
      }

      toast.error(err?.response?.data?.message || "Nu pot salva programarea.", {
        id: "saveEvent",
      });
    }
  };

  const cancelEvent = async (id: string) => {
    try {
      toast.loading("Anulez...", { id: "cancelEvent" });
      const updated = await interviewsApi.cancel(Number(id));

      setEvents((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: updated.status } : x)),
      );

      toast.success("Programarea a fost anulată", { id: "cancelEvent" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu pot anula programarea.", {
        id: "cancelEvent",
      });
    }
  };

  const goPrevMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const goToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now);
  };

  const statusUi = (s: InterviewStatus) => {
    if (s === "CONFIRMED")
      return {
        label: "Confirmat",
        cls: styles.pillOk,
        Icon: OkIcon,
        dot: styles.dotOk,
      };
    if (s === "CANCELLED")
      return {
        label: "Anulat",
        cls: styles.pillDanger,
        Icon: WarnIcon,
        dot: styles.dotDanger,
      };
    return {
      label: "Programat",
      cls: styles.pillWarn,
      Icon: PlanIcon,
      dot: styles.dotWarn,
    };
  };

  const copyToClipboard = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(okMsg);
    } catch {
      toast.error("Nu pot copia în clipboard");
    }
  };

  // Tooltip în perimetrul calendarului (înlocuiește hover toast)
  const calendarCardRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [hoverTip, setHoverTip] = useState<HoverTipState>({
    open: false,
    key: null,
    dayLabel: "",
    items: [],
    idx: 0,
    pos: { top: 0, left: 0 },
    side: "right",
    maxH: 320,
    anchor: null,
  });

  const hideHoverTipImmediate = () => {
    setHoverTip({
      open: false,
      key: null,
      dayLabel: "",
      items: [],
      idx: 0,
      pos: { top: 0, left: 0 },
      side: "right",
      maxH: 320,
      anchor: null,
    });
  };

  const hideTimerRef = useRef<number | null>(null);

  const cancelHide = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      hideHoverTipImmediate();
    }, 100);
  };

  useEffect(() => {
    return () => cancelHide();
  }, []);

  const showHoverTipForDay = (
    day: Date,
    dayKey: string,
    items: InterviewEvent[],
    anchorEl: HTMLDivElement,
  ) => {
    if (!items.length) return;
    const cardEl = calendarCardRef.current;
    if (!cardEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const a = anchorEl.getBoundingClientRect();

    const pad = 12;
    const gap = 10;

    const tipW = 280; // ține în sync cu CSS: width: 280px
    const rightCandidate = a.right - cardRect.left + gap;
    const leftCandidate = a.left - cardRect.left - tipW - gap;

    const fitsRight = rightCandidate + tipW <= cardRect.width - pad;
    const left = fitsRight ? rightCandidate : Math.max(pad, leftCandidate);
    const side: "left" | "right" = fitsRight ? "right" : "left";

    // rect relativ la calendarCard
    const anchor = {
      top: a.top - cardRect.top,
      bottom: a.bottom - cardRect.top,
      left: a.left - cardRect.left,
      right: a.right - cardRect.left,
    };

    // poziție provizorie (sub celulă), o rafinăm în useLayoutEffect după ce știm tipRect.height
    const provisionalTop = anchor.bottom + 8;

    setHoverTip((p) => ({
      ...p,
      open: true,
      key: dayKey,
      dayLabel: formatHumanDate(day),
      items,
      idx:
        p.key === dayKey ? clamp(p.idx, 0, Math.max(0, items.length - 1)) : 0,
      pos: { top: provisionalTop, left },
      side,
      maxH: p.maxH ?? 320,
      anchor,
    }));
  };

  type FieldKey =
    | "title"
    | "candidateName"
    | "candidateEmail"
    | "date"
    | "startTime"
    | "endTime"
    | "meetLink";

  type FieldErrors = Partial<Record<FieldKey, string>>;

  const mapApiValidationToFieldErrors = (err: any): FieldErrors => {
    const data = err?.response?.data;
    const msg = data?.message;

    const messages: string[] = Array.isArray(msg)
      ? msg
      : typeof msg === "string"
        ? [msg]
        : [];

    const out: FieldErrors = {};

    for (const m of messages) {
      const s = String(m);

      // NestJS style: "candidateEmail must be an email"
      const match = s.match(/^([a-zA-Z0-9_]+)\s+(.*)$/);
      const field = (match?.[1] || "").trim();
      const rest = (match?.[2] || s).trim();

      if (field === "candidateEmail") out.candidateEmail = "Email invalid";
      else if (field === "meetLink") out.meetLink = "Link invalid";
      else if (field === "title") out.title = rest || "Titlul este invalid";
      else if (field === "candidateName")
        out.candidateName = rest || "Numele este invalid";
      else if (field === "date") out.date = rest || "Data este invalidă";
      else if (field === "startTime")
        out.startTime = rest || "Ora de start este invalidă";
      else if (field === "endTime")
        out.endTime = rest || "Ora de final este invalidă";
    }

    // alt format posibil: { errors: { candidateEmail: "..." } }
    const errsObj = data?.errors;
    if (errsObj && typeof errsObj === "object") {
      for (const [k, v] of Object.entries(errsObj)) {
        if (k in out) continue;
        if (typeof v === "string") (out as any)[k] = v;
      }
    }

    return out;
  };

  const hasFieldErrors = (x: FieldErrors) => Object.keys(x).length > 0;

  const [modalServerErrors, setModalServerErrors] = useState<FieldErrors>({});

  // Clamp pe top după ce tooltip-ul e randat, ca să nu iasă din calendarCard
  useLayoutEffect(() => {
    if (!hoverTip.open) return;
    const cardEl = calendarCardRef.current;
    const tipEl = tooltipRef.current;
    if (!cardEl || !tipEl) return;
    if (!hoverTip.anchor) return;

    const pad = 12;
    const gapY = 8;

    const cardRect = cardEl.getBoundingClientRect();
    const tipRect = tipEl.getBoundingClientRect();

    // zona vizibilă: intersecția cardului cu viewport-ul
    const visTopAbs = Math.max(cardRect.top, 0);
    const visBottomAbs = Math.min(cardRect.bottom, window.innerHeight);
    const visLeftAbs = Math.max(cardRect.left, 0);
    const visRightAbs = Math.min(cardRect.right, window.innerWidth);

    const visTop = visTopAbs - cardRect.top;
    const visBottom = visBottomAbs - cardRect.top;
    const visLeft = visLeftAbs - cardRect.left;
    const visRight = visRightAbs - cardRect.left;

    // maxHeight pentru cazuri extreme
    const availableH = Math.max(160, visBottom - visTop - pad * 2);
    const nextMaxH = Math.floor(availableH);

    const h = Math.min(tipRect.height, nextMaxH);

    const a = hoverTip.anchor;
    const spaceBelow = visBottom - (a.bottom + gapY) - pad;
    const spaceAbove = a.top - gapY - visTop - pad;

    let desiredTop: number;

    if (h <= spaceBelow) {
      // încape sub celulă
      desiredTop = a.bottom + gapY;
    } else if (h <= spaceAbove) {
      // încape deasupra
      desiredTop = a.top - h - gapY;
    } else {
      // nu încape nici sus nici jos, îl centrăm pe mijlocul celulei și clamp
      const mid = (a.top + a.bottom) / 2;
      desiredTop = mid - h / 2;
    }

    const nextTop = clamp(
      desiredTop,
      visTop + pad,
      Math.max(visTop + pad, visBottom - h - pad),
    );

    // clamp pe stânga/dreapta
    const nextLeft = clamp(
      hoverTip.pos.left,
      visLeft + pad,
      Math.max(visLeft + pad, visRight - tipRect.width - pad),
    );

    if (
      nextTop !== hoverTip.pos.top ||
      nextLeft !== hoverTip.pos.left ||
      nextMaxH !== hoverTip.maxH
    ) {
      setHoverTip((p) => ({
        ...p,
        pos: { top: nextTop, left: nextLeft },
        maxH: nextMaxH,
      }));
    }
  }, [
    hoverTip.open,
    hoverTip.anchor,
    hoverTip.pos.left,
    hoverTip.items.length,
    hoverTip.idx,
  ]);

  return (
    <div className={styles.pageShell}>
      <Toaster />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* CALENDAR */}
          <section
            className={styles.calendarCard}
            ref={(el) => {
              calendarCardRef.current = el;
            }}
          >
            <header className={styles.calendarHeader}>
              <div className={styles.monthNav}>
                <button
                  className={styles.iconBtn}
                  onClick={goPrevMonth}
                  title="Luna anterioară"
                >
                  <ChevronLeft size={14} />
                </button>

                <h2 className={styles.monthLabel}>
                  <CalendarIcon size={18} className={styles.cyanGlow} />
                  {monthLabel}
                </h2>

                <button
                  className={styles.iconBtn}
                  onClick={goNextMonth}
                  title="Luna următoare"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.headerRight}>
                <button className={styles.ghostBtn} onClick={goToday}>
                  Azi
                </button>
              </div>
            </header>

            <div className={styles.filtersRow}>
              <div className={styles.searchWrap}>
                <SearchIcon className={styles.searchIcon} size={14} />
                <input
                  type="text"
                  value={query}
                  onChange={(ev) => setQuery(ev.target.value)}
                  placeholder="Caută candidat, email sau titlu..."
                />
              </div>

              <select
                className={styles.select}
                value={statusFilter}
                onChange={(ev) => setStatusFilter(ev.target.value as any)}
              >
                <option value="ALL">Toate statusurile</option>
                <option value="SCHEDULED">Programate</option>
                <option value="CONFIRMED">Confirmate</option>
                <option value="CANCELLED">Anulate</option>
              </select>
            </div>

            <div className={styles.weekHeader}>
              {["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className={styles.monthGrid}>
              {calendarDays.map((day) => {
                const key = toYMD(day);
                const dayEvents = eventsByDayKey.get(key) ?? [];
                const isInMonth = day.getMonth() === cursor.getMonth();
                const isSelected = sameDay(day, selectedDay);
                const isToday = sameDay(day, new Date());

                return (
                  <div
                    key={key}
                    className={`${styles.dayCell} ${!isInMonth ? styles.dayMuted : ""} ${
                      isSelected ? styles.daySelected : ""
                    }`}
                    onClick={() => setSelectedDay(day)}
                    onMouseEnter={(ev) => {
                      cancelHide();
                      showHoverTipForDay(
                        day,
                        key,
                        dayEvents,
                        ev.currentTarget as HTMLDivElement,
                      );
                    }}
                    onMouseLeave={scheduleHide}
                  >
                    <div className={styles.dayTop}>
                      <span
                        className={`${styles.dayNumber} ${isToday ? styles.dayToday : ""}`}
                      >
                        {day.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className={styles.countBadge}>
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className={styles.dotsRow}>
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`${styles.dot} ${statusUi(ev.status).dot}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className={styles.dotMore}>
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tooltip minimalist, în perimetrul calendarului */}
            {hoverTip.open && hoverTip.items.length ? (
              <div
                ref={(el) => {
                  tooltipRef.current = el;
                }}
                className={`${styles.dayTooltip} ${
                  hoverTip.side === "left" ? styles.tipLeft : styles.tipRight
                }`}
                style={{
                  top: hoverTip.pos.top,
                  left: hoverTip.pos.left,
                  maxHeight: hoverTip.maxH,
                }}
                onMouseEnter={() => cancelHide()}
                onMouseLeave={scheduleHide}
              >
                {(() => {
                  const count = hoverTip.items.length;
                  const idx = clamp(hoverTip.idx, 0, Math.max(0, count - 1));
                  const current = hoverTip.items[idx];
                  const ui = current ? statusUi(current.status) : null;

                  return (
                    <>
                      <div className={styles.tipTop}>
                        <div className={styles.tipTitle}>
                          <span className={styles.tipDay}>
                            {hoverTip.dayLabel}
                          </span>
                          <span className={styles.tipCount}>
                            {count} {count === 1 ? "interviu" : "interviuri"}
                          </span>
                        </div>

                        <div className={styles.tipNav}>
                          <button
                            className={styles.tipNavBtn}
                            disabled={idx <= 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setHoverTip((p) => ({
                                ...p,
                                idx: clamp(
                                  p.idx - 1,
                                  0,
                                  Math.max(0, p.items.length - 1),
                                ),
                              }));
                            }}
                            aria-label="Anterior"
                          >
                            <ChevronLeft size={12} />
                          </button>

                          <span className={styles.tipNavIndex}>
                            {count ? `${idx + 1}/${count}` : "0/0"}
                          </span>

                          <button
                            className={styles.tipNavBtn}
                            disabled={idx >= count - 1}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setHoverTip((p) => ({
                                ...p,
                                idx: clamp(
                                  p.idx + 1,
                                  0,
                                  Math.max(0, p.items.length - 1),
                                ),
                              }));
                            }}
                            aria-label="Următor"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>

                      {current ? (
                        <div className={styles.tipBody}>
                          <div className={styles.tipRow}>
                            <span className={styles.tipTime}>
                              <ClockIcon size={11} />{" "}
                              {formatHour(current.startAt)} -{" "}
                              {formatHour(current.endAt)}
                            </span>

                            {ui ? (
                              <span className={`${styles.tipPill} ${ui.cls}`}>
                                <ui.Icon size={10} /> {ui.label}
                              </span>
                            ) : null}
                          </div>

                          <div className={styles.tipName}>
                            <UserIcon size={11} />{" "}
                            <strong>{current.candidateName}</strong>
                          </div>

                          <div className={styles.tipEventTitle}>
                            {current.title}
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            ) : null}

            {loadingEvents ? (
              <div className={styles.loadingBar}>
                Se încarcă programările...
              </div>
            ) : null}
          </section>

          {/* AGENDA */}
          <aside className={styles.agendaCard}>
            <div className={styles.agendaHeader}>
              <div>
                <h3 className={styles.agendaTitle}>Agenda Zilei</h3>
                <p className={styles.agendaSub}>
                  {formatHumanDate(selectedDay)}
                </p>
              </div>
              <button className={styles.smallBtn} onClick={openCreate}>
                <Plus size={12} /> Adaugă
              </button>
            </div>

            <div className={styles.agendaList}>
              {agendaEvents.length ? (
                agendaEvents.map((ev) => {
                  const ui = statusUi(ev.status);

                  return (
                    <article key={ev.id} className={styles.agendaItem}>
                      <div className={styles.agendaTopRow}>
                        <span className={styles.agendaTime}>
                          <ClockIcon size={12} /> {formatHour(ev.startAt)} -{" "}
                          {formatHour(ev.endAt)}
                        </span>

                        <span className={`${styles.statusPill} ${ui.cls}`}>
                          <ui.Icon size={10} /> {ui.label}
                        </span>
                      </div>

                      <div className={styles.agendaMain}>
                        <div className={styles.agendaName}>
                          <UserIcon size={13} />{" "}
                          <strong>{ev.candidateName}</strong>
                        </div>

                        <div className={styles.agendaTitleLine}>
                          <span className={styles.eventTitle}>{ev.title}</span>
                        </div>

                        {ev.location ? (
                          <div className={styles.metaLine}>
                            <MarkerIcon size={12} />{" "}
                            <span className={styles.mono}>{ev.location}</span>
                          </div>
                        ) : null}

                        {ev.candidateEmail ? (
                          <div className={styles.metaLine}>
                            <LinkIcon size={12} />
                            <span className={styles.mono}>
                              {ev.candidateEmail}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                copyToClipboard(
                                  ev.candidateEmail!,
                                  "Email copiat",
                                )
                              }
                              title="Copiază email"
                            >
                              <CopyIcon size={12} />
                            </button>
                          </div>
                        ) : null}

                        {ev.meetLink ? (
                          <div className={styles.metaLine}>
                            <FaLink size={12} />
                            <a
                              href={ev.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.link}
                            >
                              Link Întâlnire
                            </a>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                copyToClipboard(ev.meetLink!, "Link copiat")
                              }
                              title="Copiază link"
                            >
                              <CopyIcon size={12} />
                            </button>
                          </div>
                        ) : null}

                        {ev.notes ? (
                          <p className={styles.notes}>{ev.notes}</p>
                        ) : null}
                      </div>

                      <div className={styles.agendaActions}>
                        <button
                          className={styles.iconActionBtn}
                          onClick={() => openEdit(ev)}
                          title="Editează"
                          disabled={ev.status === "CANCELLED"}
                        >
                          <EditIcon size={14} />
                        </button>

                        <button
                          className={`${styles.iconActionBtn} ${styles.dangerBtn}`}
                          onClick={() => cancelEvent(ev.id)}
                          title="Anulează"
                          disabled={ev.status === "CANCELLED"}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.empty}>
                  <div className={styles.emptyBadge}>
                    <PlanIcon size={16} />
                  </div>
                  <h3>Nicio programare</h3>
                  <p>Nu ai interviuri planificate pentru această zi.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* MODAL */}
        <CalendarEventModal
          isOpen={isModalOpen}
          isEditing={Boolean(editingId)}
          form={form}
          setForm={setForm}
          onClose={() => {
            setIsModalOpen(false);
            setModalServerErrors({});
          }}
          onSubmit={saveEvent}
          serverErrors={modalServerErrors}
          clearServerErrors={() => setModalServerErrors({})}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
