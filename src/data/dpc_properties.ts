import raw from "./DPC_PROPERTIES.json";
import type { DataCategory, PropertyDef } from "../types/types";

// Narrow a string to DataCategory at runtime (and compile-time)
function asDataCategory(s: string): DataCategory {
  if (s === "simple" || s === "behavioral" || s === "financial" || s === "sensitive") {
    return s;
  }
  // If any row in JSON is out of allowed set, throw to catch data issues early
  throw new Error(`Invalid DataCategory in DPC_PROPERTIES.json: "${s}"`);
}

// Map raw JSON → strongly-typed PropertyDef[]
export const DPC_PROPERTIES: PropertyDef[] = (raw as Array<{
  key: string;
  label: string;
  category: string;
  eiKey: null; // present in JSON, but PropertyDef may or may not include it
}>).map((r) => ({
  key: r.key,
  label: r.label,
  category: asDataCategory(r.category),
  // If your PropertyDef supports eiKey, keep it; if not, omit the field.
  // Uncomment the next line ONLY if PropertyDef includes `eiKey?: EICategoryKey | null`
  eiKey: null,
}));
