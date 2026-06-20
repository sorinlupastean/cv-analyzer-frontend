import React, { type ComponentType } from "react";
import type { IconBaseProps } from "react-icons";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  icon?: ComponentType<IconBaseProps>;
  title: string;
  description: string;
  className?: string;
  footer?: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
  footer,
}) => {
  return (
    <div className={[styles.emptyState, className].join(" ")}>
      <div className={styles.card}>
        {Icon ? (
          <div className={styles.badge}>
            <Icon className={styles.icon} />
          </div>
        ) : null}

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
};

export default EmptyState;
