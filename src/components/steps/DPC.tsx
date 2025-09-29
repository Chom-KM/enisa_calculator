// src/components/steps/DPC.tsx
import { useMemo, useState, useEffect, type FC, useCallback } from "react";
import type { DataCategory, PropertyDef } from "../../types/types";
import { CATEGORY_HINTS, CATEGORY_SCORES } from "../../types/types";
import { DPC_PROPERTIES } from "../../data/dpc_properties";
import styles from "../../styles/Steps.module.css";
import controls from "../../styles/Controls.module.css";

type ScoreMap = Record<string, number | null>;

type Props = {
  value: number;
  scores: ScoreMap;
  onChange: (u: { value: number; scores: ScoreMap }) => void;
  catalog?: PropertyDef[];
};

const DPC: FC<Props> = ({ value, scores, onChange, catalog }) => {
  const catalogRows = useMemo<PropertyDef[]>(
    () => (catalog && catalog.length ? catalog : DPC_PROPERTIES),
    [catalog]
  );

  // 🚫 No fallbacks — start empty unless parent provided some keys
  const initialSelectedKeys = useMemo(
    () => Object.keys(scores).filter((k) => catalogRows.some((r) => r.key === k)),
    [scores, catalogRows]
  );

  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelectedKeys);

  // Track which row's hint is open (by property key)
  const [openHintFor, setOpenHintFor] = useState<string | null>(null);

  useEffect(() => {
    setSelectedKeys((prev) => prev.filter((k) => catalogRows.some((r) => r.key === k)));
  }, [catalogRows]);

  // Sync selected keys → parent scores & DPC(max)
  useEffect(() => {
    const nextScores: ScoreMap = {};
    for (const key of selectedKeys) {
      nextScores[key] = key in scores ? scores[key] : null;
    }
    const vals = Object.values(nextScores).filter((v): v is number => typeof v === "number");
    const nextMax = vals.length > 0 ? Math.max(...vals) : 0;

    const sameKeys =
      Object.keys(nextScores).length === Object.keys(scores).length &&
      Object.keys(nextScores).every((k) => Object.prototype.hasOwnProperty.call(scores, k));

    const sameValues = sameKeys && Object.keys(nextScores).every((k) => nextScores[k] === scores[k]);

    if (!sameKeys || !sameValues || value !== nextMax) {
      onChange({ value: nextMax, scores: nextScores });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);

  // Search / add
  const [q, setQ] = useState("");
  const normalized = q.trim().toLowerCase();
  const [isFocused, setIsFocused] = useState(false);

  const available = useMemo(
    () => catalogRows.filter((r) => !selectedKeys.includes(r.key)),
    [catalogRows, selectedKeys]
  );

  const suggestions = useMemo(() => {
    if (!isFocused) return [];
    const base = available;
    if (!normalized) return base.slice(0, 12); // show all on focus (cap to 12)
    return base
      .filter(
        (r) =>
          r.label.toLowerCase().includes(normalized) ||
          r.key.toLowerCase().includes(normalized)
      )
      .slice(0, 12);
  }, [isFocused, available, normalized]);

  const addRow = useCallback(
    (key: string) => {
      if (!catalogRows.some((r) => r.key === key)) return;
      setSelectedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setQ("");
    },
    [catalogRows]
  );

  const removeRow = (key: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    setOpenHintFor((curr) => (curr === key ? null : curr));
  };

  // Scoring
  const selectedRows = useMemo(
    () => selectedKeys.map((k) => catalogRows.find((r) => r.key === k)).filter(Boolean) as PropertyDef[],
    [selectedKeys, catalogRows]
  );

  const maxScore = useMemo(() => {
    const selectedOnly = selectedKeys
      .map((k) => scores[k])
      .filter((v): v is number => typeof v === "number");
    return selectedOnly.length > 0 ? Math.max(...selectedOnly) : 0;
  }, [scores, selectedKeys]);

  function handleScoreChange(propKey: string, next: number | null) {
    const nextScores: ScoreMap = { ...scores, [propKey]: next };
    const vals = selectedKeys
      .map((k) => nextScores[k])
      .filter((v): v is number => typeof v === "number");
    const nextMax = vals.length > 0 ? Math.max(...vals) : 0;
    onChange({ value: nextMax, scores: nextScores });
  }

  return (
    <section>
      <div className={styles.stepH2}>
        <h2>Data Processing Context (DPC)</h2>
      </div>

      {/* Add row control */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
      <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 6 }}>
        เพิ่มแถว (พิมพ์เพื่อค้นหา)
      </label>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // allow clicks on suggestions before closing
          setTimeout(() => setIsFocused(false), 120);
        }}
        placeholder="คลิกเพื่อดูทั้งหมด หรือพิมพ์: ชื่อ-นามสกุล, E-mail, เลขบัตร..."
        aria-label="ค้นหา property"
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          background: "#fff",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && suggestions.length > 0) {
            e.preventDefault();
            addRow(suggestions[0].key);
            setQ("");
          }
          if (e.key === "Escape") {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />

      {isFocused && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 10,
            top: "100%",
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            maxHeight: 280,
            overflowY: "auto",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          }}
          onMouseDown={(e) => {
            // prevent blur before click finishes
            e.preventDefault();
          }}
        >
          {suggestions.map((sug) => (
            <li key={sug.key}>
              <button
                type="button"
                className={controls.button}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderRadius: 0,
                  display: "block",
                }}
                onClick={() => {
                  addRow(sug.key);
                  setQ("");
                  // keep open to add multiple quickly; comment next line if you prefer it to close
                  // setIsFocused(false);
                }}
              >
                {sug.label}
                <span style={{ color: "#6b7280" }}> · {labelForCategory(sug.category)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

      {/* Table */}
      {selectedRows.length > 0 ? (
        <>
          <table className={styles.table}>
            <thead>
              <tr className={styles.trHeader}>
                <th>Property</th>
                <th>Category</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {selectedRows.map((p) => {
                const allowed = CATEGORY_SCORES[p.category];
                const v = scores[p.key] ?? null;
                const isOpen = openHintFor === p.key;
                return (
                  <>
                    <tr key={p.key}>
                      <td>
                        <div>
                          <span style={{marginRight: "1rem"}}>{p.label}</span>
                          <button
                            type="button"
                            className={controls.button}
                            onClick={() => removeRow(p.key)}
                            aria-label={`ลบ ${p.label}`}
                            title="ลบแถวนี้"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span>{labelForCategory(p.category)}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={controls.select}
                          value={v ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            handleScoreChange(p.key, raw === "" ? null : Number(raw));
                          }}
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
                            onClick={() => setOpenHintFor((curr) => (curr === p.key ? null : p.key))}
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
                            <ul>
                              {CATEGORY_HINTS[p.category].map((line, idx) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}></td>
                <td>
                  <strong>DPC: {maxScore}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      ) : (
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          ยังไม่มีแถวที่เลือก — เพิ่มแถวจากช่องค้นหาด้านบน
        </p>
      )}
    </section>
  );
};

export default DPC;

/* helpers */
function labelForCategory(cat: DataCategory) {
  switch (cat) {
    case "simple": return "Simple Data";
    case "behavioral": return "Behavioral Data";
    case "financial": return "Financial Data";
    case "sensitive": return "Sensitive Data";
  }
}
