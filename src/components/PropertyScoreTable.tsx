// src/components/PropertyScoreTable.tsx
import type { OptionDef, DataCategory } from "../types/types";
import { CATEGORY_SCORES } from "../types/types";

type ScoreMap = Record<string, number | null>; // property.key -> score|null

type Props = {
  option: OptionDef;
  scores: ScoreMap;
  onChangeScore: (propKey: string, score: number | null) => void;
};

export default function PropertyScoreTable({ option, scores, onChangeScore }: Props) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Property</th>
          <th style={th}>Category</th>
          <th style={th}>Score</th>
        </tr>
      </thead>
      <tbody>
        {option.properties.map((p) => {
          const cat: DataCategory = p.category;
          const allowed = CATEGORY_SCORES[cat];
          const value = scores[p.key] ?? null;

          return (
            <tr key={p.key}>
              <td style={td}>{p.label}</td>
              <td style={td}>{labelForCategory(cat)}</td>
              <td style={td}>
                <select
                  value={value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChangeScore(p.key, v === "" ? null : Number(v));
                  }}
                >
                  <option value="">— Select —</option>
                  {allowed.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: "8px" };

function labelForCategory(cat: DataCategory) {
  switch (cat) {
    case "simple": return "Simple Data";
    case "behavioral": return "Behavioral Data";
    case "financial": return "Financial Data";
    case "sensitive": return "Sensitive Data";
  }
}
