// src/components/Stepper.tsx
import type { FC } from "react";
import styles from "../styles/Stepper.module.css";

type StepperProps = {
  step: number;      // current step index (0-based)
  labels: string[];  // e.g. ["DPC", "EI", "CB", "Result"]
};

const Stepper: FC<StepperProps> = ({ step, labels }) => {
  return (
    <ol className={styles.stepper} role="list" aria-label="Progress">
      {labels.map((label, i) => {
        const stateClass =
          i === step ? styles.active : i < step ? styles.done : "";
        return (
          <li key={label} className={`${styles.item} ${stateClass}`}>
            <span className={styles.index} aria-hidden="true">
              {i + 1}
            </span>
            <span className={styles.label}>{label}</span>
            {/* Optionally add aria-current for the active item */}
            {i === step && <span className="sr-only" aria-current="step" />}
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
