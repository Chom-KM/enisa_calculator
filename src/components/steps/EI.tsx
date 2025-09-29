// src/components/steps/EI.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { EIPropertyDef, EICategoryKey } from "../../types/types";
import { EI_CATEGORY_SCORES, EI_PROPERTIES, EICATEGORY_HINTS } from "../../types/types";
import controls from "../../styles/Controls.module.css";
import styles from "../../styles/Steps.module.css";

export type EIScore = number;

export type EIState<Key extends string = string> = {
  enabled: Record<Key, boolean>;
  scores: Record<Key, EIScore | null>;
};

type Props = {
  /** Optional: pass a custom list; defaults to global EI_PROPERTIES */
  properties?: EIPropertyDef[];
  /** Persisted state from parent (optional) */
  initialState?: Partial<EIState<EICategoryKey>>;
  /** Emit on change */
  onChange?: (state: EIState<EICategoryKey>) => void;
  readOnly?: boolean;
};

const EI: React.FC<Props> = ({
  properties,
  initialState,
  onChange,
  readOnly = false,
}) => {
  // Freeze rows (use global EI_PROPERTIES by default)
  const rows = useMemo<EIPropertyDef[]>(
    () => properties ?? EI_PROPERTIES,
    [properties]
  );

  type Key = EICategoryKey;

  // Build initial enabled/scores
  const buildEnabled = (): Record<Key, boolean> => {
    const base = {} as Record<Key, boolean>;
    rows.forEach((r) => {
      const init = initialState?.enabled?.[r.key as Key];
      base[r.key as Key] = typeof init === "boolean" ? init : !!r.preselected;
    });
    return base;
  };

  const buildScores = (): Record<Key, EIScore | null> => {
    const base = {} as Record<Key, EIScore | null>;
    rows.forEach((r) => {
      const init = initialState?.scores?.[r.key as Key];
      base[r.key as Key] = typeof init === "number" ? init : null;
    });
    return base;
  };

  const [enabled, setEnabled] = useState<Record<Key, boolean>>(buildEnabled);
  const [scores, setScores] = useState<Record<Key, EIScore | null>>(buildScores);
  const [openHintFor, setOpenHintFor] = useState<Key | null>(null);

  // Rebuild defaults when rows change
  useEffect(() => {
    setEnabled(buildEnabled());
    setScores(buildScores());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  // Emit combined state to parent
  useEffect(() => {
    onChange?.({ enabled, scores });
  }, [enabled, scores, onChange]);

  // Close hint if its row gets disabled
  useEffect(() => {
    if (openHintFor && !enabled[openHintFor]) {
      setOpenHintFor(null);
    }
  }, [enabled, openHintFor]);

  const toggleEnabled = (key: Key) => {
    if (readOnly) return;
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        setScores((s) => ({ ...s, [key]: null }));
      }
      return next;
    });
  };

  const setScore = (key: Key, value: string) => {
    if (readOnly) return;
    const parsed = value === "" ? null : Number(value);
    setScores((prev) => ({ ...prev, [key]: (parsed as EIScore | null) }));
  };

  // EI (max)
  const maxScore = useMemo(() => {
    let max = 0;
    (Object.keys(enabled) as Key[]).forEach((k) => {
      if (!enabled[k]) return;
      const v = scores[k];
      if (typeof v === "number" && v > max) max = v;
    });
    return max;
  }, [enabled, scores]);

  return (
    <section>
      <div className={styles.stepH2}>
        <h2>Ease of Identification (EI)</h2>
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.trHeader}>
            <th>ข้อมูลส่วนบุคคลที่ท่านเลือก</th>
            <th>Enabled?</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row.key as Key;
            const isEnabled = enabled[key];
            const scoreVal = scores[key];
            const allowed = EI_CATEGORY_SCORES[key] ?? [];
            const isOpen = openHintFor === key;

            return (
              <React.Fragment key={row.key}>
                <tr>
                  <td>{row.label}</td>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!isEnabled}
                        onChange={() => toggleEnabled(key)}
                        disabled={readOnly}
                      />
                    </label>
                  </td>
                  <td>
                    <div>
                      <select
                        className={controls.select}
                        value={scoreVal ?? ""}
                        onChange={(e) => setScore(key, e.target.value)}
                        disabled={!isEnabled || readOnly}
                      >
                        <option value="">— Select —</option>
                        {allowed.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={styles.hintLink}
                        onClick={() => setOpenHintFor((curr) => (curr === key ? null : key))}
                        disabled={!isEnabled}   // 🚨 disable if row not enabled
                      >
                        hint
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Hint row */}
                {isOpen && (
                  <tr>
                    <td colSpan={3}>
                      <div className={styles.hintBox}>
                        <strong>คำแนะนำการให้คะแนน:</strong>
                        <ul className={styles.hintList}>
                          {(EICATEGORY_HINTS[key] ?? []).map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}></td>
            <td>
              <strong>EI: {maxScore}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
};

export default EI;
