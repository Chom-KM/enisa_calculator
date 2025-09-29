// src/components/SearchSelect.tsx
import { useMemo, useState } from "react";
import type { OptionDef } from "../types/types";

type Props = {
  options: OptionDef[];
  onSelect: (opt: OptionDef) => void;
};

export default function SearchSelect({ options, onSelect }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(o => o.label.toLowerCase().includes(s));
  }, [q, options]);

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหา… (เช่น บัตรเครดิต)"
        aria-label="ค้นหา"
      />
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {filtered.map((o) => (
          <li key={o.id}>
            <button type="button" onClick={() => onSelect(o)}>
              {o.label}
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li>ไม่พบผลลัพธ์</li>}
      </ul>
    </div>
  );
}
