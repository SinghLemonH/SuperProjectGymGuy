import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// 💡 ข้อแนะนำ: ถ้าขึ้นเส้นแดงที่ไฟล์นี้ ให้ลองเติมจุดเพิ่มเป็น "../../api/exercise.api"
import { getExerciseById, type Exercise } from "../api/exercise.api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const toLabel = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DIFF_LABEL: Record<string, string> = {
  "1": "Level 1 — Beginner",
  "2": "Level 2 — Easy",
  "3": "Level 3 — Intermediate",
  "4": "Level 4 — Hard",
  "5": "Level 5 — Expert",
};

const IMPACT_LABEL: Record<string, string> = {
  "1": "Minor", "2": "Light", "3": "Moderate", "4": "Strong", "5": "Primary",
};

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

// ─── component ────────────────────────────────────────────────────────────────

export default function ExerciseDetail() {
  const { id }                  = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getExerciseById(id)
      .then(setExercise)
      .catch(() => setError("Exercise not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={S.page}><p style={S.muted}>Loading...</p></div>;

  if (error || !exercise) {
    return (
      <div style={S.page}>
        <p style={S.errorText}>{error ?? "Exercise not found."}</p>
        <Link to="/exercises" style={S.backLink}>← Back to Exercises</Link>
      </div>
    );
  }

  const cat = getCatStyle(exercise.category);

  // 🛡️ ป้องกันบัคจากฝั่งเซิร์ฟเวอร์ด้วยตัวแปรลูกผสม (Hybrid Mapping)
  const diffValue = String(exercise.difficultyLevel ?? exercise.difficulty_level ?? "");
  const calorieRateValue = exercise.calorieRate ?? exercise.calorie_rate ?? 0;
  const isScoreBased = exercise.scoreBased ?? exercise.score_based;
  const targetMuscles = exercise.muscleMapping ?? exercise.muscle_mapping ?? [];

  return (
    <div style={S.page}>

      {/* back link */}
      <Link to="/exercises" style={S.backLink}>← Back to Exercises</Link>

      {/* title */}
      <div style={S.titleBlock}>
        <div style={S.titleRow}>
          <h1 style={S.title}>{exercise.name}</h1>
          <span style={{ ...S.catBadge, background: cat.bg, color: cat.color }}>
            {toLabel(exercise.category)}
          </span>
        </div>
        <span style={S.codeText}>{exercise.code}</span>
      </div>

      <hr style={S.divider} />

      {/* stat cards — 3 across */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <span style={S.statLabel}>Difficulty</span>
          <span style={S.statValue}>{DIFF_LABEL[diffValue] ?? diffValue}</span>
        </div>
        <div style={S.statCard}>
          <span style={S.statLabel}>Calorie rate</span>
          <span style={S.statValue}>{calorieRateValue} kcal/rep</span>
        </div>
        <div style={S.statCard}>
          <span style={S.statLabel}>Score based</span>
          <span style={S.statValue}>{isScoreBased ? "Yes" : "No"}</span>
        </div>
      </div>

      {/* description */}
      {exercise.description && (
        <div style={S.section}>
          <h2 style={S.sectionTitle}>Description</h2>
          <p style={S.descText}>{exercise.description}</p>
        </div>
      )}

      {/* muscle mapping — ยืดหยุ่นรองรับการจัดเรียงข้อมูลทั้งสองสไตล์ */}
      {targetMuscles.length > 0 && (
        <div style={S.section}>
          <h2 style={S.sectionTitle}>Muscles targeted</h2>
          <div style={S.muscleList}>
            {targetMuscles.map((m) => {
              const impact = m.impactLevel ?? m.impact_level ?? 0;
              const pct = (Number(impact) / 5) * 100;
              return (
                <div key={m.id} style={S.muscleRow}>
                  <span style={S.muscleName}>{toLabel(m.muscle)}</span>
                  <div style={S.barBg}>
                    <div style={{ ...S.barFill, width: `${pct}%`, background: cat.color }} />
                  </div>
                  <span style={S.impactLabel}>{IMPACT_LABEL[String(impact)] ?? impact}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px 28px", background: "#ffffff", minHeight: "100%",
    fontFamily: "'DM Sans', 'Noto Sans Thai', sans-serif", color: "#111827", maxWidth: 680,
  },
  backLink: { fontSize: 13, color: "#6b7280", textDecoration: "none", display: "inline-block", marginBottom: 16 },
  muted: { color: "#9ca3af", fontSize: 13 },
  errorText: { color: "#dc2626", fontSize: 13, marginBottom: 12 },
  divider: { border: "none", borderTop: "1px solid #f3f4f6", margin: "16px 0" },
  titleBlock: { marginBottom: 16 },
  titleRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 600, margin: 0 },
  catBadge: { fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 5 },
  codeText: { fontSize: 12, color: "#9ca3af", fontFamily: "monospace" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 },
  statCard: {
    background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px",
    display: "flex", flexDirection: "column" as const, gap: 4,
  },
  statLabel: { fontSize: 11, color: "#9ca3af" },
  statValue: { fontSize: 15, fontWeight: 600, color: "#111827" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 },
  descText: { fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: 0 },
  muscleList: { display: "flex", flexDirection: "column" as const, gap: 10 },
  muscleRow: { display: "grid", gridTemplateColumns: "140px 1fr 72px", alignItems: "center", gap: 10 },
  muscleName: { fontSize: 13, fontWeight: 500, color: "#374151" },
  barBg: { height: 5, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  impactLabel: { fontSize: 11, color: "#9ca3af", textAlign: "right" as const },
};