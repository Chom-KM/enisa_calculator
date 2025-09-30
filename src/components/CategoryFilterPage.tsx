import { useEffect, useMemo, useState } from "react";
import styles from "../styles/Controls.module.css"; // 👈 use your module

/** Types */
export type CategoryItem = {
  id: string | number;
  label: string;
  category: string; // e.g., "simple" | "behavioral" | "financial" | "sensitive"
  description?: string;
};

export type CategoryFilterPageProps = {
  /** Required: list of items to render */
  items: CategoryItem[];
  /** Optional: human-friendly names for category chips */
  categoryDisplayMap?: Record<string, string>;
  /** Optional: show built-in search box (default true) */
  enableSearch?: boolean;
  /** Optional: start with all categories active (default true) */
  startAllActive?: boolean;
  /** Optional: UI copy */
  title?: string;
  subtitle?: string;
};

/** Utility: group counts per category */
function countByCategory(items: CategoryItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
}

/** Small, accessible toggle chip (uses Controls.module.css) */
function ToggleChip({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        styles.button,          // base button
        active ? styles.primary : "", // primary variant when active
      ].join(" ")}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      {typeof count === "number" && (
        <span
          style={{
            display: "inline-block",
            borderRadius: "9999px",
            padding: "0.125rem 0.5rem",
            fontSize: "0.75rem",
            background: active ? "rgba(255,255,255,0.2)" : "#f3f4f6",
            color: active ? "white" : "#4b5563",
            border: active ? "1px solid transparent" : "1px solid #e5e7eb",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function CategoryFilterPage({
  items,
  categoryDisplayMap,
  enableSearch = true,
  startAllActive = true,
  title = "Items",
  subtitle = "Toggle categories to filter the list below. Use search to narrow further.",
}: CategoryFilterPageProps) {
  // Derived sets
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items]
  );
  const counts = useMemo(() => countByCategory(items), [items]);

  // Active category state — initialize from current categories
  const [active, setActive] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    for (const c of categories) base[c] = !!startAllActive;
    return base;
  });

  // Sync when items (and thus categories) change
  useEffect(() => {
    setActive((prev) => {
      const next: Record<string, boolean> = {};
      for (const c of categories) {
        next[c] = c in prev ? prev[c] : !!startAllActive;
      }
      return next;
    });
  }, [categories, startAllActive]);

  // Optional text search
  const [q, setQ] = useState("");

  const allActive = useMemo(
    () => categories.length > 0 && categories.every((c) => active[c]),
    [categories, active]
  );

  const noneActive = useMemo(
    () => categories.every((c) => !active[c]),
    [categories, active]
  );

  const filtered = useMemo(() => {
    const byCat = items.filter((i) => active[i.category]);
    if (!q.trim()) return byCat;
    const needle = q.trim().toLowerCase();
    return byCat.filter(
      (i) =>
        i.label.toLowerCase().includes(needle) ||
        (i.description ? i.description.toLowerCase().includes(needle) : false)
    );
  }, [items, active, q]);

  function toggleCategory(c: string) {
    setActive((prev) => ({ ...prev, [c]: !prev[c] }));
  }

  function setAll(on: boolean) {
    setActive((prev) => {
      const next: Record<string, boolean> = { ...prev };
      for (const c of categories) next[c] = on;
      return next;
    });
  }

  // Map category key -> display label (fallback to key)
  const catLabel = (key: string) => categoryDisplayMap?.[key] ?? key;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "0.875rem", color: "#475569" }}>{subtitle}</p>
        )}
      </header>

      {/* Category bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          marginBottom: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          background: "rgba(255,255,255,0.9)",
          padding: "0.75rem",
          backdropFilter: "saturate(180%) blur(10px)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          {categories.map((c) => (
            <ToggleChip
              key={c}
              label={catLabel(c)}
              active={!!active[c]}
              onClick={() => toggleCategory(c)}
              count={counts[c]}
            />
          ))}

          {/* Spacer */}
          <div style={{ flexGrow: 1 }} />

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setAll(true)}
              disabled={allActive}
              className={[styles.button].join(" ")}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              disabled={noneActive}
              className={styles.button}
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Search */}
        {enableSearch && (
          <div style={{ marginTop: "0.75rem" }}>
            <label
              style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}
            >
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to filter…"
              style={{
                marginTop: "0.25rem",
                display: "block",      // ✅ force block-level
                width: "100%",         // ✅ take all available width
                maxWidth: "100%",      // ✅ prevent overflow
                boxSizing: "border-box", // ✅ include padding/border in width calc
                border: "1px solid #d1d5db",
                borderRadius: "0.75rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                outline: "none",
                flexShrink: 0,         // ✅ stops flex from squashing it
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(16,185,129,0.2)";
                e.currentTarget.style.borderColor = "#10b981";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <section aria-live="polite" style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
          Showing <span style={{ fontWeight: 600 }}>{filtered.length}</span> of {items.length}
        </div>

        {filtered.length === 0 ? (
          <EmptyState noneActive={noneActive} />
        ) : (
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
              gap: "0.75rem",
              listStyle: "none", padding:0
            }}
          >
            {filtered.map((i) => (
              <li
                key={i.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "1rem",
                  background: "white",
                  padding: "1rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.2 }}>
                    {i.label}
                  </h3>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      borderRadius: "9999px",
                      border: "1px solid #e5e7eb",
                      padding: "0.125rem 0.5rem",
                      fontSize: "0.75rem",
                      color: "#475569",
                    }}
                  >
                    {catLabel(i.category)}
                  </span>
                </div>
                {i.description && (
                  <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#475569" }}>
                    {i.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ noneActive }: { noneActive: boolean }) {
  return (
    <div
      style={{
        border: "1px dashed #e5e7eb",
        borderRadius: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#475569" }}>
        {noneActive
          ? "No categories are enabled. Turn on one or more categories to see items."
          : "No items match your current filters."}
      </p>
    </div>
  );
}
