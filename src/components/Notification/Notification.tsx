import React, { useEffect } from "react";
import styles from "./Notification.module.css";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

// --- FIX TYPESCRIPT ---
const CheckCircleIcon =
  FaCheckCircle as unknown as ComponentType<IconBaseProps>;
const ExclamationTriangleIcon =
  FaExclamationTriangle as unknown as ComponentType<IconBaseProps>;
const TimesIcon = FaTimes as unknown as ComponentType<IconBaseProps>;

export type NotificationType = "success" | "error" | null;

interface NotificationProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  // Auto-close după 5 secunde
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${type === "success" ? styles.success : styles.error}`}
    >
      <div className={styles.iconWrapper}>
        {type === "success" ? <CheckCircleIcon /> : <ExclamationTriangleIcon />}
      </div>

      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.message}>{message}</span>
      </div>

      <button className={styles.closeBtn} onClick={onClose}>
        <TimesIcon />
      </button>
    </div>
  );
};

export default Notification;
