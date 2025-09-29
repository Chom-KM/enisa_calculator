// src/components/steps/CB.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { CBPropertyDef, CBCategoryKey } from "../../types/types";
import { CB_CATEGORY_SCORES, CBCATEGORY_HINTS } from "../../types/types";
import styles from "../../styles/Steps.module.css";
import controls from "../../styles/Controls.module.css";

export type CBScore = number;

export type CBState<Key extends string = string> = {
  enabled: Record<Key, boolean>;
  scores: Record<Key, CBScore | null>;
};

type Props = {
  properties: CBPropertyDef[];               // your cb_properties (like ei_properties)
  initialState?: Partial<CBState>;           // persisted state from parent (optional)
  onChange?: (state: CBState) => void;       // emit on change
  readOnly?: boolean;
};

const CB: React.FC<Props> = ({
  properties,
  initialState,
  onChange,
  readOnly = false,
}) => {
  type Key = CBCategoryKey;

  // Build initial from either parent's initialState or the option's preselected flags
  const buildEnabled = (): Record<Key, boolean> => {
    const base = {} as Record<Key, boolean>;
    properties.forEach((p) => {
      const init = (initialState?.enabled as Record<string, boolean> | undefined)?.[p.key];
      base[p.key as Key] = typeof init === "boolean" ? init : !!p.preselected;
    });
    return base;
  };

  const buildScores = (): Record<Key, CBScore | null> => {
    const base = {} as Record<Key, CBScore | null>;
    properties.forEach((p) => {
      const init = (initialState?.scores as Record<string, number | null> | undefined)?.[p.key];
      base[p.key as Key] = typeof init === "number" ? init : null;
    });
    return base;
  };

  const [enabled, setEnabled] = useState<Record<Key, boolean>>(buildEnabled);
  const [scores, setScores] = useState<Record<Key, CBScore | null>>(buildScores);
  const [openHintFor, setOpenHintFor] = useState<Key | null>(null);

  // Rebuild defaults when properties change
  useEffect(() => {
    setEnabled(buildEnabled());
    setScores(buildScores());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.length]);

  // Emit combined state to parent
  useEffect(() => {
    onChange?.({ enabled, scores });
  }, [enabled, scores, onChange]);

  // Auto-close an open hint if the row gets disabled
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
    setScores((prev) => ({ ...prev, [key]: (parsed as CBScore | null) }));
  };

  // CB = sum of enabled row scores
  const sumScore = useMemo(() => {
    let sum = 0;
    (Object.keys(enabled) as Key[]).forEach((k) => {
      if (!enabled[k]) return;
      const v = scores[k];
      if (typeof v === "number") sum += v;
    });
    return sum;
  }, [enabled, scores]);

  return (
    <section>
      <div className={styles.stepH2}>
        <h2>Circumstance of Breach (CB)</h2>
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.trHeader}>
            <th>Category</th>
            <th>Enabled?</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => {
            const key = p.key as Key;
            const isEnabled = enabled[key];
            const scoreVal = scores[key];
            const allowed = CB_CATEGORY_SCORES[key] ?? [];
            const isOpen = openHintFor === key;

            return (
              <React.Fragment key={p.key}>
                <tr>
                  <td>{p.label}</td>
                  <td>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!isEnabled}
                        onChange={() => toggleEnabled(key)}
                        disabled={readOnly}
                      />
                    </label>
                  </td>
                  <td>
                    {/* no flex wrapper, per your request */}
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
                    {" "}
                    <button
                      type="button"
                      className={styles.hintLink}
                      onClick={() => setOpenHintFor((curr) => (curr === key ? null : key))}
                      disabled={!isEnabled}  // disable hint if row is not selected
                    >
                      hint
                    </button>
                  </td>
                </tr>

                {/* Hint row */}
                {isOpen && (
                  <tr>
                    <td colSpan={3}>
                      <div className={styles.hintBox}>
                        <strong>คำแนะนำการให้คะแนน:</strong>
                        <ul className={styles.hintList}>
                          {(CBCATEGORY_HINTS[key] ?? []).map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
                          ช่วงคะแนนที่ใช้ได้: {allowed.join(" , ")}
                        </div>
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
              <strong>CB: {sumScore}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
};

export default CB;
