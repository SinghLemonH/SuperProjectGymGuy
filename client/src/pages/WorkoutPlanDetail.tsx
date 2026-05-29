import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  type WorkoutPlan,
  type WorkoutPlanExercise,
} from "../api/plan.api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const toLabel = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  strength:        { bg: "#ede9fe", color: "#6d28d9" },
  cardio:          { bg: "#fce7f3", color: "#be185d" },
  body_weight:     { bg: "#dcfce7", color: "#15803d" },
  flexibility:     { bg: "#fef9c3", color: "#a16207" },
  plyometric:      { bg: "#ffe4e6", color: "#be123c" },
  olympic_lifting: { bg: "#ede9fe", color: "#7c3aed" },
  strongman:       { bg: "#ffedd5", color: "#c2410c" },
};
const getCatStyle = (cat?: string) =>
  cat ? (CAT_STYLE[cat] ?? { bg: "#f3f4f6", color: "#374151" }) : { bg: "#f3f4f6", color: "#374151" };

const formatDate = (d?: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const metaLine = (ex: WorkoutPlanExercise) => {
  const parts: string[] = [];
  if (ex.targetSets != null && ex.targetReps != null)
    parts.push(`${ex.targetSets} sets × ${ex.targetReps} reps`);
  else if (ex.targetSets != null)
    parts.push(`${ex.targetSets} sets`);
  if (ex.targetDuration != null) parts.push(`${ex.targetDuration} sec`);
  if (ex.targetWeight   != null) parts.push(`${ex.targetWeight} kg`);
  return parts.join(" · ");
};

const DAY_NAMES: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday",
};

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ plan, onClose, onSaved }: {
  plan: WorkoutPlan; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    planName:    plan.planName,
    startDate:   plan.startDate,
    endDate:     plan.endDate,
    description: plan.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.planName.trim()) { setErr("Plan name is required."); return; }
    setSaving(true); setErr(null);
    try {
      // Backend returns { success: true } (not the full plan), so we just
      // notify the parent and let it re-fetch the fresh data.
      await updateWorkoutPlan(plan.id, form);
      onSaved();
    } catch { setErr("Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.box} onClick={(e) => e.stopPropagation()}>
        <h2 style={M.title}>Edit plan</h2>

        <label style={M.label}>Plan name *</label>
        <input style={M.input} value={form.planName} onChange={(e) => set("planName", e.target.value)} />

        <label style={M.label}>Description</label>
        <input style={M.input} value={form.description} onChange={(e) => set("description", e.target.value)} />

        <div style={M.row}>
          <div style={{ flex: 1 }}>
            <label style={M.label}>Start date</label>
            <input style={M.input} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={M.label}>End date</label>
            <input style={M.input} type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>

        {err && <p style={M.err}>{err}</p>}
        <div style={M.btnRow}>
          <button style={M.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button style={M.saveBtn}   onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkoutPlanDetail() {
  const { id }                    = useParams<{ id: string }>();
  const navigate                  = useNavigate();
  const [plan, setPlan]           = useState<WorkoutPlan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [checked, setChecked]     = useState<Set<string>>(new Set());
  const [showEdit, setShowEdit]   = useState(false);
  const [showDel, setShowDel]     = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true); setError(null);
    getWorkoutPlanById(id)
      .then((data) => { setPlan(data); setActiveDay(1); setChecked(new Set()); })
      .catch(() => setError("Workout plan not found."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div style={S.page}><p style={S.muted}>Loading...</p></div>;
  if (error || !plan) {
    return (
      <div style={S.page}>
        <p style={S.errorText}>{error ?? "Not found."}</p>
        <button style={S.backBtn} onClick={() => navigate("/workout-plans")}>← Back</button>
      </div>
    );
  }

  const exercises   = plan.exercises ?? [];
  const dayNumbers  = [...new Set(exercises.map((e) => e.dateNumber ?? 1))].sort((a, b) => a - b);
  const showTabs    = dayNumbers.length > 1;
  const currentEx   = exercises.filter((e) => (e.dateNumber ?? 1) === activeDay);
  const doneCount   = currentEx.filter((e) => checked.has(e.id)).length;
  const totalCount  = currentEx.length;
  const pctSession  = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const pctOverall  = Number(plan.completeness ?? 0);

  const toggle = (exId: string) =>
    setChecked((prev) => { const n = new Set(prev); n.has(exId) ? n.delete(exId) : n.add(exId); return n; });

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteWorkoutPlan(plan.id); navigate("/workout-plans"); }
    catch { setDeleting(false); setShowDel(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => navigate("/workout-plans")}>← Back</button>
        <div style={S.menuRow}>
          <button style={S.menuBtn} onClick={() => setShowEdit(true)}>Edit</button>
          <button style={{ ...S.menuBtn, color: "#dc2626" }} onClick={() => setShowDel(true)}>Delete</button>
        </div>
      </div>

      <h1 style={S.title}>{plan.planName}</h1>
      <p style={S.dateRange}>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</p>
      {plan.description && <p style={S.desc}>{plan.description}</p>}

      <div style={S.overallRow}>
        <div style={S.overallBg}>
          <div style={{ ...S.overallFill, width: `${pctOverall}%`, background: pctOverall >= 100 ? "#0f766e" : pctOverall > 0 ? "#6366f1" : "#e5e7eb" }} />
        </div>
        <span style={S.overallPct}>{pctOverall}% complete</span>
      </div>

      <hr style={S.divider} />
      <p style={S.subtitle}>Select the day to work out today</p>

      {showTabs && (
        <div style={S.tabRow}>
          {dayNumbers.map((d) => (
            <button
              key={d}
              style={activeDay === d ? S.tabActive : S.tabInactive}
              onClick={() => { setActiveDay(d); setChecked(new Set()); }}
            >
              {DAY_NAMES[d] ?? `Day ${d}`}
            </button>
          ))}
        </div>
      )}

      <div style={S.statsRow}>
        {[
          { num: doneCount,          label: "done" },
          { num: totalCount,         label: "total" },
          { num: `${pctSession}%`,   label: "complete" },
        ].map((s) => (
          <div key={s.label} style={S.statCard}>
            <span style={S.statNum}>{s.num}</span>
            <span style={S.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={S.progBg}>
        <div style={{ ...S.progFill, width: `${pctSession}%`, background: pctSession >= 80 ? "#10b981" : pctSession >= 40 ? "#6366f1" : "#e5e7eb" }} />
      </div>

      {currentEx.length === 0 ? (
        <p style={S.muted}>No exercises for this plan yet.</p>
      ) : (
        <div style={S.exList}>
          {currentEx.map((ex) => {
            const done = checked.has(ex.id);
            const cat  = getCatStyle(ex.category);
            return (
              <div key={ex.id} style={{ ...S.exRow, opacity: done ? 0.65 : 1 }} onClick={() => toggle(ex.id)}>
                <div style={{ ...S.checkbox, ...(done ? S.checkboxDone : {}) }}>
                  {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
                </div>
                <div style={S.exInfo}>
                  <span style={{ ...S.exName, textDecoration: done ? "line-through" : "none", color: done ? "#9ca3af" : "#111827" }}>
                    {ex.exerciseName ?? "Exercise"}
                  </span>
                  {metaLine(ex) && <span style={S.exMeta}>{metaLine(ex)}</span>}
                  {ex.note && <span style={S.exNote}>{ex.note}</span>}
                </div>
                {ex.category && (
                  <span style={{ ...S.catBadge, background: cat.bg, color: cat.color }}>
                    {toLabel(ex.category)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {doneCount > 0 && (
        <button style={S.finishBtn}>Finish Session</button>
      )}

      {showEdit && (
        <EditModal plan={plan} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}

      {showDel && (
        <div style={M.overlay} onClick={() => setShowDel(false)}>
          <div style={{ ...M.box, maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={M.title}>Delete plan</h2>
            <p style={M.body}>Are you sure you want to delete <strong>"{plan.planName}"</strong>? This cannot be undone.</p>
            <div style={M.btnRow}>
              <button style={M.cancelBtn} onClick={() => setShowDel(false)} disabled={deleting}>Cancel</button>
              <button style={{ ...M.saveBtn, background: "#dc2626" }} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: { padding: "24px 32px", background: "#fbfbfe", minHeight: "100%", fontFamily: "'DM Sans', 'Inter', sans-serif", color: "#111827", maxWidth: 800 },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backBtn: { fontSize: 14, fontWeight: 500, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0 },
  menuRow: { display: "flex", gap: 12 },
  menuBtn: { fontSize: 13, fontWeight: 600, color: "#4b5563", background: "#fff", border: "1px solid #d1d5db", cursor: "pointer", padding: "6px 12px", borderRadius: 6 },

  title: { fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "#111827" },
  dateRange: { fontSize: 13, color: "#6b7280", margin: "0 0 12px" },
  desc: { fontSize: 14, color: "#374151", margin: "0 0 20px", lineHeight: 1.5 },

  overallRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  overallBg: { flex: 1, height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  overallFill: { height: "100%", borderRadius: 999, transition: "width 0.4s ease" },
  overallPct: { fontSize: 13, fontWeight: 600, color: "#4b5563" },

  divider: { border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 24px" },
  subtitle: { fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 },

  tabRow: { display: "flex", gap: 8, overflowX: "auto" as const, paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" },
  tabActive: { padding: "8px 20px", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap" as const },
  tabInactive: { padding: "8px 20px", background: "#fff", border: "1px solid #e5e7eb", color: "#4b5563", fontSize: 14, fontWeight: 500, borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap" as const },

  statsRow: { display: "flex", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px", display: "flex", flexDirection: "column" as const, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: 0.5, fontWeight: 600 },

  progBg: { height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 24 },
  progFill: { height: "100%", borderRadius: 999, transition: "width 0.3s ease" },

  exList: { display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 },
  exRow: { display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, cursor: "pointer", transition: "all 0.2s" },
  checkbox: { width: 22, height: 22, flexShrink: 0, border: "2px solid #d1d5db", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, transition: "all 0.2s" },
  checkboxDone: { background: "#10b981", borderColor: "#10b981" },
  exInfo: { flex: 1, display: "flex", flexDirection: "column" as const, gap: 4 },
  exName: { fontSize: 16, fontWeight: 600, transition: "color 0.2s" },
  exMeta: { fontSize: 13, color: "#6b7280" },
  exNote: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" as const },
  catBadge: { fontSize: 11, padding: "4px 10px", borderRadius: 12, fontWeight: 600, flexShrink: 0, marginTop: 2 },

  finishBtn: { width: "100%", padding: "14px", background: "#111827", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },

  muted: { color: "#6b7280", fontSize: 14, textAlign: "center" as const, marginTop: 40 },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" as const, marginTop: 40 },
};

const M: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  box: { background: "#fff", borderRadius: 12, padding: "24px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  title: { fontSize: 18, fontWeight: 600, margin: "0 0 16px", color: "#111827" },
  label: { fontSize: 13, fontWeight: 500, color: "#6b7280", display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 8, color: "#111827", background: "#fff", marginBottom: 16, boxSizing: "border-box" as const, outline: "none" },
  row: { display: "flex", gap: 16 },
  body: { fontSize: 14, color: "#374151", marginBottom: 24, lineHeight: 1.6 },
  err: { fontSize: 13, color: "#dc2626", marginBottom: 12 },
  btnRow: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 },
  cancelBtn: { padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, color: "#374151", cursor: "pointer" },
  saveBtn: { padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#6366f1", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" },
};