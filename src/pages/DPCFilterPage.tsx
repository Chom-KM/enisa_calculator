// src/pages/DPCFilterPage.tsx
import { useMemo } from "react";
import CategoryFilterPage, { type CategoryItem } from "../components/CategoryFilterPage";
import raw from "../data/DPC_PROPERTIES.json";

// (optional) pretty labels for chips
const CATEGORY_LABELS: Record<string, string> = {
  simple: "Simple Data",
  behavioral: "Behavioral Data",
  financial: "Financial Data",
  sensitive: "Sensitive Data",
};

export default function DPCFilterPage() {
  // Map your JSON shape -> CategoryItem[]
  const items: CategoryItem[] = useMemo(
    () =>
      (raw as Array<{ key: string; label: string; category: string; eiKey: null }>).map(
        (r, idx) => ({
          id: r.key || idx,       // stable id if available
          label: r.label,
          category: r.category,   // e.g., "behavioral"
          // description: optionally add more fields if you have them
        })
      ),
    []
  );

  return (
    <CategoryFilterPage
      items={items}
      categoryDisplayMap={CATEGORY_LABELS}
      enableSearch
      startAllActive
      title="ข้อมูลของ DPC"
      subtitle="เปิด/ปิดหมวดหมู่เพื่อกรองรายการ หรือพิมพ์เพื่อค้นหา"
    />
  );
}
