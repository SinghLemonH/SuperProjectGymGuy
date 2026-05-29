import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  type WorkoutPlan,
  type CreateWorkoutPlanPayload,
} from "../api/plan.api";
import { getUser } from "../api/auth";

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (d?: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const getStatus = (pct: number) => {
  if (pct >= 100) return { label: "done",     bg: "#f3f4f6", color: "#374151" };
  if (pct > 0)    return { label: "active",   bg: "#ccfbf1", color: "#0f766e" };
  return                 { label: "upcoming", bg: "#ffedd5", color: "#c2410c" };
};

const barColor = (pct: number) =>
  pct >= 100 ? "#0f766e" : pct > 0 ? "#6366f1" : "#e5e7eb";

// dynamic colors for tags based on words
const getDescTagStyle = (desc: string) => {
  const d = desc.toLowerCase();
  if (d.includes("muscle") || d.includes("strength")) return { bg: "#ede9fe", color: "#6d28d9" };
  if (d.includes("endurance") || d.includes("cardio")) return { bg: "#ccfbf1", color: "#0f766e" };
  return { bg: "#fef3c7", color: "#b45309" };
};

const today = () => new Date().toISOString().split("T")[0];

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface PlanModalProps {
  mode: "create" | "edit";
  initial?: WorkoutPlan;
  onClose: () => void;
  onSaved: () => void;
}

function PlanModal({ mode, initial, onClose, onSaved }: PlanModalProps) {
  const [form, setForm] = useState<CreateWorkoutPlanPayload>({
    planName:    initial?.planName    ?? "",
    startDate:   initial?.startDate   ?? today(),
    endDate:     initial?.endDate     ?? today(),
    description: initial?.description ?? "",
    difficulty:  initial?.difficulty  ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const set = (k: keyof CreateWorkoutPlanPayload, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.planName.trim())  { setErr("Plan name is required.");  return false; }
    if (!form.startDate)        { setErr("Start date is required."); return false; }
    if (!form.endDate)          { setErr("End date is required.");   return false; }
    if (form.endDate < form.startDate) { setErr("End date must be after start date."); return false; }
    if (!form.difficulty || form.difficulty < 1 || form.difficulty > 5)
      { setErr("Difficulty must be between 1 and 5."); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setErr(null);
    try {
      if (mode === "edit" && initial) {
        await updateWorkoutPlan(initial.id, form);
      } else {
        await createWorkoutPlan(form);
      }
      onSaved();
    } catch {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.box} onClick={(e) => e.stopPropagation()}>
        <div style={M.header}>
          <h2 style={M.title}>{mode === "create" ? "New workout plan" : "Edit plan"}</h2>
          <button style={M.closeBtn} onClick={onClose}>✕</button>
        </div>

        <label style={M.label}>Plan name *</label>
        <input style={M.input} value={form.planName} onChange={(e) => set("planName", e.target.value)} placeholder="e.g. Strength A — Upper/Lower Split" />

        <label style={M.label}>Description</label>
        <input style={M.input} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="e.g. muscle gain, endurance..." />

        <div style={M.row}>
          <div style={{ flex: 1 }}>
            <label style={M.label}>Start date *</label>
            <input style={M.input} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={M.label}>End date *</label>
            <input style={M.input} type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>

        <label style={M.label}>Difficulty (1 – 5) *</label>
        <div style={M.diffRow}>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              style={{
                ...M.diffBtn,
                background: form.difficulty === d ? "#6366f1" : "#f9fafb",
                color:      form.difficulty === d ? "#fff"    : "#374151",
                border:     form.difficulty === d ? "1px solid #6366f1" : "1px solid #e5e7eb",
              }}
              onClick={() => set("difficulty", d)}
              type="button"
            >
              {d}
            </button>
          ))}
        </div>

        {err && <p style={M.err}>{err}</p>}

        <div style={M.btnRow}>
          <button style={M.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button style={M.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : (mode === "create" ? "Create plan" : "Save changes")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ planName, onCancel, onConfirm, deleting }: {
  planName: string; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <div style={M.overlay} onClick={onCancel}>
      <div style={{ ...M.box, maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={M.title}>Delete plan</h2>
        <p style={M.body}>Delete <strong>"{planName}"</strong>? This action cannot be undone.</p>
        <div style={M.btnRow}>
          <button style={M.cancelBtn} onClick={onCancel} disabled={deleting}>Cancel</button>
          <button style={{ ...M.saveBtn, background: "#dc2626" }} onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkoutPlans() {
  const [plans, setPlans]         = useState<WorkoutPlan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<WorkoutPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutPlan | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const navigate                  = useNavigate();
  const userId                    = getUser()?.id ?? "";

  const fetchPlans = () => {
    if (!userId) { setError("User not found. Please log in again."); setLoading(false); return; }
    setLoading(true); setError(null);
    getUserPlans(userId)
      .then((res) => setPlans(res.data ?? []))
      .catch(() => setError("Failed to load plans. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (e: React.MouseEvent, plan: WorkoutPlan) => {
    e.stopPropagation();
    setEditTarget(plan);
    setModal("edit");
  };

  const openDelete = (e: React.MouseEvent, plan: WorkoutPlan) => {
    e.stopPropagation();
    setDeleteTarget(plan);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWorkoutPlan(deleteTarget.id);
      setDeleteTarget(null);
      fetchPlans();
    } catch {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaved = () => {
    setModal(null);
    setEditTarget(null);
    fetchPlans();
  };

  return (
    <div style={S.page}>
      {/* ── page header ── */}
      <div style={S.headerContainer}>
        <h1 style={S.pageTitle}>Workout plan</h1>
        <hr style={S.divider} />
      </div>

      <div style={S.topBar}>
        <span style={S.subTitle}>Workout plans</span>
        <button style={S.createBtn} onClick={() => setModal("create")}>
          + New plan
        </button>
      </div>

      {/* ── loading / error / empty ── */}
      {error   && <p style={S.errorText}>{error}</p>}
      {loading && (
        <div style={S.skeletonWrap}>
          {[1, 2, 3].map((i) => <div key={i} style={S.skeleton} />)}
        </div>
      )}
      {!loading && !error && plans.length === 0 && (
        <div style={S.emptyState}>
          <p style={S.emptyTitle}>No workout plans yet</p>
          <p style={S.emptyDesc}>Click "+ New plan" to create your first workout plan.</p>
          <button style={S.emptyBtn} onClick={() => setModal("create")}>+ New plan</button>
        </div>
      )}

      {/* ── plan cards ── */}
      {!loading && plans.length > 0 && (
        <div style={S.list}>
          {plans.map((plan) => {
            const pct    = Number(plan.completeness ?? 0);
            const status = getStatus(pct);
            const descStyle = plan.description ? getDescTagStyle(plan.description) : null;

            return (
              <div key={plan.id} style={S.card}>
                <div style={S.cardBody} onClick={() => navigate(`/workout-plans/${plan.id}`)}>

                  {/* Row 1: Plan Name & Status Badge */}
                  <div style={S.cardTop}>
                    <p style={S.planName}>{plan.planName}</p>
                    <span style={{ ...S.statusBadge, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Row 2: Date Range */}
                  <p style={S.dateText}>
                    {fmt(plan.startDate)} – {fmt(plan.endDate)}
                  </p>

                  {/* Row 3: Progress Bar */}
                  <div style={S.progressRow}>
                    <div style={S.barBg}>
                      <div style={{
                        ...S.barFill,
                        width: `${pct}%`,
                        background: barColor(pct),
                      }} />
                    </div>
                    <span style={S.pctText}>{pct}%</span>
                  </div>

                  {/* Row 4: Tags */}
                  <div style={S.tagRow}>
                    {plan.description && (
                      <span style={{ ...S.tag, background: descStyle?.bg, color: descStyle?.color }}>
                        {plan.description}
                      </span>
                    )}
                    <span style={S.tag}>Level {plan.difficulty}</span>
                    {plan.exerciseCount != null && (
                      <span style={S.tag}>{plan.exerciseCount} exercises</span>
                    )}
                  </div>

                </div>

                {/* Actions (Hover/Edit/Delete) */}
                <div style={S.actions}>
                  <button style={S.editBtn} onClick={(e) => openEdit(e, plan)}>Edit</button>
                  <button style={S.deleteBtn} onClick={(e) => openDelete(e, plan)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal === "create" && <PlanModal mode="create" onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal === "edit" && editTarget && <PlanModal mode="edit" initial={editTarget} onClose={() => { setModal(null); setEditTarget(null); }} onSaved={handleSaved} />}
      {deleteTarget && <DeleteModal planName={deleteTarget.planName} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}
    </div>
  );
}

// ─── Page styles ──────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px 32px", background: "#fbfbfe", minHeight: "100%",
    fontFamily: "'DM Sans', 'Inter', sans-serif", color: "#111827", maxWidth: 800
  },
  headerContainer: { marginBottom: 24 },
  pageTitle: { fontSize: 20, fontWeight: 700, margin: "0 0 16px" },
  divider: { border: "none", borderTop: "1px solid #e5e7eb", margin: 0 },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: 600, color: "#111827" },
  createBtn: {
    padding: "6px 14px", background: "#fff", border: "1px solid #d1d5db",
    borderRadius: 20, fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
  },
  errorText: { color: "#dc2626", fontSize: 13, marginBottom: 12 },

  skeletonWrap: { display: "flex", flexDirection: "column" as const, gap: 16 },
  skeleton: { height: 120, background: "#f3f4f6", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" },

  emptyState: { textAlign: "center" as const, paddingTop: 48 },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: "#9ca3af", marginBottom: 16 },
  emptyBtn: { padding: "8px 20px", background: "#6366f1", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" },

  list: { display: "flex", flexDirection: "column" as const, gap: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", position: "relative" as const },
  cardBody: { padding: "16px 20px", cursor: "pointer" },

  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  planName: { fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 },

  dateText: { fontSize: 12, color: "#6b7280", margin: "0 0 16px" },

  progressRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  barBg: { flex: 1, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.4s ease" },
  pctText: { fontSize: 12, fontWeight: 600, color: "#374151", minWidth: 32, textAlign: "right" as const },

  tagRow: { display: "flex", gap: 8, flexWrap: "wrap" as const },
  tag: { fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#f3f4f6", color: "#4b5563", fontWeight: 500 },

  actions: { display: "flex", borderTop: "1px solid #f3f4f6" },
  editBtn: { flex: 1, padding: "10px", fontSize: 12, fontWeight: 500, background: "#fafafa", border: "none", color: "#6366f1", cursor: "pointer", transition: "background 0.2s" },
  deleteBtn: { flex: 1, padding: "10px", fontSize: 12, fontWeight: 500, background: "#fafafa", border: "none", borderLeft: "1px solid #f3f4f6", color: "#dc2626", cursor: "pointer", transition: "background 0.2s" },
};

const M: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  box: { background: "#fff", borderRadius: 12, padding: "24px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontSize: 18, fontWeight: 600, margin: 0, color: "#111827" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9ca3af", cursor: "pointer", padding: "2px 4px" },
  label: { fontSize: 13, fontWeight: 500, color: "#6b7280", display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 8, color: "#111827", background: "#fff", marginBottom: 16, boxSizing: "border-box" as const, outline: "none" },
  row: { display: "flex", gap: 16 },
  diffRow: { display: "flex", gap: 8, marginBottom: 20 },
  diffBtn: { flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" },
  body: { fontSize: 14, color: "#374151", marginBottom: 24, lineHeight: 1.6 },
  err: { fontSize: 13, color: "#dc2626", marginBottom: 12 },
  btnRow: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 },
  cancelBtn: { padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, color: "#374151", cursor: "pointer" },
  saveBtn: { padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#6366f1", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" },
};