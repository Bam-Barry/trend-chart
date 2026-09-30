"use client";

import type { ReactNode } from "react";
import { intFmt } from "../chart-formatters";
import styles from "../bklit.module.css";

export interface TooltipRow {
  color: string;
  label: string;
  value: string | number;
}

export interface TooltipContentProps {
  title?: string;
  rows: TooltipRow[];
  /** Optional additional content (e.g., markers) */
  children?: ReactNode;
}

export function TooltipContent({ title, rows, children }: TooltipContentProps) {
  return (
    <div className={styles.clip}>
      <div className={styles.tipBody}>
        {title && (
          <div className={styles.tipTitle}>
            {title}
          </div>
        )}
        <div className={styles.tipRows}>
          {rows.map((row) => (
            <div
              className={styles.tipRow}
              key={`${row.label}-${row.color}`}
            >
              <div className={styles.tipKey}>
                <span
                  className={styles.tipDot}
                  style={{ backgroundColor: row.color }}
                />
                <span className={styles.tipName}>
                  {row.label}
                </span>
              </div>
              <span className={styles.tipValue}>
                {typeof row.value === "number" ? intFmt(row.value) : row.value}
              </span>
            </div>
          ))}
        </div>

        {children && (
          <div className={styles.tipExtra}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

TooltipContent.displayName = "TooltipContent";

export default TooltipContent;
