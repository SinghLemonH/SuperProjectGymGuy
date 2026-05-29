import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// 💡 ข้อแนะนำ: ถ้าขึ้นเส้นแดงที่ไฟล์นี้ ให้ลองเติมจุดเพิ่มเป็น "../../api/exercise.api"
import { getExercises, type ExerciseListItem } from "../api/exercise.api";

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "",         label: "All categories" },
  { value: "strength",       label: "Strength" },
  { value: "cardio",         label: "Cardio" },
  { value: "body_weight",    label: "Body weight" },
  { value: "flexibility",    label: "Flexibility" },
  { value: "plyometric",     label: "Plyometric" },
  { value: "olympic_lifting",label: "Olympic lifting" },
  { value: "strongman",      label: "Strongman" },
];

const DIFFICULTIES = [
  { value: "", label: "All levels" },
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
  { value: "4", label: "Level 4" },
  { value: "5", label: "Level 5" },
];

const PAGE_LIMIT = 6;

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  strength:        { bg: "#dbeafe", color: "#1d4ed8" },
  cardio:          { bg: "#fce7f3", color: "#be185d" },
  body_weight:     { bg: "#dcfce7", color: "#15803d" },
  flexibility:     { bg: "#fef9c3", color: "#a16207" },
  plyometric:      { bg: "#ffe4e6", color: "#be123c" },
  olympic_lifting: { bg: "#ede9fe", color: "#7c3aed" },
  strongman:       { bg: "#ffedd5", color: "#c2410c" },
};
const getCatStyle = (cat: string) =>
  CAT_STYLE[cat] ?? { bg: "#f3f4f6", color: "#374151" };

const toLabel = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ─── component ────────────────────────────────────────────────────────────────

export default function Exercises() {
  const [exercises, setExercises]   = useState<ExerciseListItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [category, setCategory]     = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);

  // reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [category, difficulty]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page",  String(page));
    params.set("limit", String(PAGE_LIMIT));
    if (category)   params.set("category",         category);
    if (difficulty) params.set("difficulty_level", difficulty);

    setLoading(true);
    setError(null);

    getExercises(params.toString())
      .then((res) => {
        setExercises(res.data ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setError("Failed to load exercises. Please try again."))
      .finally(() => setLoading(false));
  }, [page, category, difficulty]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div style={S.page}>

      {/* ── header ── */}
      <div style={S.topBar}>
        <h1 style={S.pageTitle}>Exercise</h1>
        <div style={S.filterRow}>
          <div style={S.selectWrap}>
            <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <span style={S.arrow}>▾</span>
          </div>
          <div style={S.selectWrap}>
            <select style={S.select} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <span style={S.arrow}>▾</span>
          </div>
        </div>
      </div>

      {/* ── feedback states ── */}
      {error   && <p style={S.errorText}>{error}</p>}
      {loading && <p style={S.muted}>Loading exercises...</p>}
      {!loading && !error && exercises.length === 0 && (
        <p style={S.muted}>No exercises found. Try adjusting your filters.</p>
      )}

      {/* ── 2-column grid ── */}
      {!loading && exercises.length > 0 && (
        <div style={S.grid}>
          {exercises.map((ex) => {
            const cat = getCatStyle(ex.category);
            
            // 🛡️ ระบบดักหลุด: เลือกใช้ค่าที่มีข้อมูลจริง ไม่ว่าจะเป็นรูปแบบสไตล์ไหน
            const diffLevel = ex.difficultyLevel ?? ex.difficulty_level ?? "-";
            const calRate = Number(ex.calorieRate ?? ex.calorie_rate ?? 0);
            const barWidth = calRate <= 1 ? calRate * 100 : Math.min(100, (calRate / 5) * 100);

            return (
              <Link key={ex.id} to={`/exercises/${ex.id}`} style={S.card}>
                <div style={S.cardTop}>
                  <span style={S.cardName}>{ex.name}</span>
                  <div style={S.badges}>
                    {/* category badge */}
                    <span style={{ ...S.badge, background: cat.bg, color: cat.color }}>
                      {toLabel(ex.category)}
                    </span>
                    {/* level badge — รองรับทั้งคู่ */}
                    <span style={S.levelBadge}>Level {diffLevel}</span>
                  </div>
                </div>

                {/* decorative bar — ปลอดภัยจากค่าว่าง */}
                <div style={S.barBg}>
                  <div style={{ ...S.barFill, width: `${barWidth}%`, background: cat.color }} />
                </div>

                {/* description as muscle hint */}
                {ex.description && <p style={S.desc}>{ex.description}</p>}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── pagination ── */}
      {!loading && (
        <div style={S.pagination}>
          <button
            style={{ ...S.pgBtn, opacity: page <= 1 ? 0.35 : 1 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Previous
          </button>
          <span style={S.pgText}>Page {page} of {totalPages}</span>
          <button
            style={{ ...S.pgBtn, opacity: page >= totalPages ? 0.35 : 1 }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px 28px", background: "#ffffff", minHeight: "100%",
    fontFamily: "'DM Sans', 'Noto Sans Thai', sans-serif", color: "#111827",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, flexWrap: "wrap" as const, gap: 12,
  },
  pageTitle: { fontSize: 20, fontWeight: 600, margin: 0, color: "#111827" },
  filterRow: { display: "flex", gap: 8 },
  selectWrap: { position: "relative" as const },
  select: {
    appearance: "none" as const, WebkitAppearance: "none" as const,
    padding: "7px 30px 7px 12px", border: "1px solid #e5e7eb", borderRadius: 7,
    fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none", minWidth: 130,
  },
  arrow: {
    position: "absolute" as const, right: 9, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none" as const, fontSize: 10, color: "#9ca3af",
  },
  errorText: { color: "#dc2626", fontSize: 13, marginBottom: 12 },
  muted: { color: "#9ca3af", fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  card: {
    display: "block", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "14px 16px", textDecoration: "none", color: "#111827", cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 },
  cardName: { fontSize: 14, fontWeight: 600, flex: 1, lineHeight: 1.4 },
  badges: { display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap" as const, justifyContent: "flex-end" },
  badge: { fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4 },
  levelBadge: { fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "#f3f4f6", color: "#6b7280" },
  barBg: { height: 3, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 8 },
  barFill: { height: "100%", borderRadius: 999 },
  desc: {
    fontSize: 11, color: "#9ca3af", margin: 0, lineHeight: 1.5,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
  },
  pagination: { display: "flex", alignItems: "center", gap: 12 },
  pgBtn: { padding: "6px 14px", border: "none", background: "transparent", color: "#6366f1", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  pgText: { fontSize: 13, color: "#6b7280" },
};