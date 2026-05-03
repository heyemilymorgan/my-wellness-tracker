import { useState, useEffect } from "react";

// ─── PALETTE (from inspo) ─────────────────────────────────────────────────────
const C = {
  midnight:   "#2D3030",   // dark background
  olive:      "#4A5240",   // deep olive green
  coffee:     "#5C7260",   // muted sage
  grape:      "#9B6B72",   // dusty rose / mauve
  parchment:  "#C4A99A",   // warm tan
  peony:      "#EDE4DC",   // lightest blush / cream
  cream:      "#F5EFE8",   // off-white
  white:      "#FFFFFF",
};

// ─── GOALS ────────────────────────────────────────────────────────────────────
const GOALS = {
  calories: 1900,
  protein: 128,
  carbs: 195,
  fat: 63,
  fiber: 25,
  water: 3,    // HydroJug fills (32 oz each = 96 oz total)
  steps: 10000,
};

const MACRO_COLORS = {
  calories: C.parchment,
  protein:  C.grape,
  carbs:    C.coffee,
  fat:      C.olive,
  fiber:    "#8FA68C",
};

const DEFAULT_CHECKLIST = [
  { id: "workout",    label: "Complete workout",         icon: "🏋️" },
  { id: "steps",      label: "Hit 10,000 steps",         icon: "👟" },
  { id: "water",      label: "Drink 3 HydroJugs (96 oz)", icon: "💧" },
  { id: "protein",    label: "Hit protein goal",         icon: "🥩" },
  { id: "sleep",      label: "8 hours of sleep",         icon: "😴" },
  { id: "veggies",    label: "Eat vegetables",           icon: "🥦" },
  { id: "journal",    label: "Log food journal",         icon: "📓" },
  { id: "mindset",    label: "Mindset / gratitude",      icon: "✨" },
];

const WORKOUT_TYPES = ["Push", "Pull", "Lower A", "Lower B", "Cardio", "Rest"];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().split("T")[0];
}
function loadDay(key) {
  try { return JSON.parse(localStorage.getItem("wt_" + key) || "null"); } catch { return null; }
}
function saveDay(key, data) {
  try { localStorage.setItem("wt_" + key, JSON.stringify(data)); } catch {}
}
function getDefaultDayData() {
  return {
    checklist: DEFAULT_CHECKLIST.map(i => ({ ...i, done: false })),
    water: 0,
    steps: 0,
    workout: { type: "", notes: "", done: false },
    foodLog: [],
  };
}

// ─── RADIAL RING ─────────────────────────────────────────────────────────────
function Ring({ value, max, color, size = 80, stroke = 7, label, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(196,169,154,0.2)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
        <text
          x={size/2} y={size/2}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px`, fill: "#2D3030", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}
        >
          {Math.round(value)}
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 10, color: "#C4A99A" }}>of {max}{sub}</div>
      </div>
    </div>
  );
}

// ─── MACRO BAR ────────────────────────────────────────────────────────────────
function MacroBar({ label, value, goal, color, unit = "g" }) {
  const pct = Math.min((value / goal) * 100, 100);
  const remaining = Math.max(goal - value, 0);
  const over = value > goal;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        <span style={{ fontSize: 12, color: "rgba(45,48,48,0.5)" }}>
          <span style={{ color: "#2D3030", fontWeight: 700 }}>{Math.round(value)}</span>
          /{goal}{unit}
          {over
            ? <span style={{ color: C.grape, marginLeft: 6 }}>+{Math.round(value - goal)} over</span>
            : <span style={{ color: "#C4A99A", marginLeft: 6 }}>{Math.round(remaining)} left</span>
          }
        </span>
      </div>
      <div style={{ background: "rgba(196,169,154,0.2)", borderRadius: 6, height: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: pct + "%", borderRadius: 6,
          background: over ? C.grape : color,
          transition: "width 0.5s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
    </div>
  );
}

// ─── FOOD ENTRY MODAL ────────────────────────────────────────────────────────
function FoodModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "", meal: "Breakfast" });
  const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleAdd() {
    if (!form.name) return;
    onAdd({
      id: Date.now(),
      name: form.name,
      meal: form.meal,
      calories: +form.calories || 0,
      protein: +form.protein || 0,
      carbs: +form.carbs || 0,
      fat: +form.fat || 0,
      fiber: +form.fiber || 0,
    });
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(45,48,48,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
    }}>
      <div style={{
        background: "#F5EFE8", border: "1px solid rgba(196,169,154,0.3)", borderRadius: 20,
        padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(45,48,48,0.2)"
      }}>
        <h3 style={{ margin: "0 0 20px", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", color: "#2D3030", letterSpacing: "-0.01em" }}>Log Food</h3>

        {/* Meal selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {meals.map(m => (
            <button key={m} onClick={() => set("meal", m)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              background: form.meal === m ? "#2D3030" : "rgba(196,169,154,0.15)",
              color: form.meal === m ? "#EDE4DC" : "rgba(45,48,48,0.5)",
              transition: "all 0.2s", fontFamily: "'Jost', sans-serif"
            }}>{m}</button>
          ))}
        </div>

        <input
          placeholder="Food name *"
          value={form.name} onChange={e => set("name", e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { key: "calories", label: "Calories", color: MACRO_COLORS.calories },
            { key: "protein",  label: "Protein (g)", color: MACRO_COLORS.protein },
            { key: "carbs",    label: "Carbs (g)", color: MACRO_COLORS.carbs },
            { key: "fat",      label: "Fat (g)", color: MACRO_COLORS.fat },
            { key: "fiber",    label: "Fiber (g)", color: MACRO_COLORS.fiber },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 10, left: 14, width: 8, height: 8, borderRadius: "50%", background: color }} />
              <input
                placeholder={label}
                type="number" min="0"
                value={form[key]} onChange={e => set(key, e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30, marginBottom: 0 }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btnStyle, background: "rgba(196,169,154,0.2)", color: "#2D3030", flex: 1 }}>Cancel</button>
          <button onClick={handleAdd} style={{ ...btnStyle, background: "#2D3030", color: "#EDE4DC", flex: 2, fontWeight: 700 }}>Add to Log</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#F5EFE8", border: "1px solid rgba(196,169,154,0.35)",
  borderRadius: 10, padding: "11px 14px", color: "#2D3030", fontSize: 13,
  outline: "none", marginBottom: 10, fontFamily: "'Jost', sans-serif", fontWeight: 400
};
const btnStyle = {
  padding: "12px 20px", borderRadius: 12, border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 600, fontFamily: "'Jost', sans-serif",
  letterSpacing: "0.08em", transition: "all 0.2s"
};

// ─── WORKOUT MODAL ────────────────────────────────────────────────────────────
function WorkoutModal({ workout, onSave, onClose }) {
  const [form, setForm] = useState(workout);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(45,48,48,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
    }}>
      <div style={{
        background: "#F5EFE8", border: "1px solid rgba(196,169,154,0.3)", borderRadius: 20,
        padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 30px 80px rgba(45,48,48,0.2)"
      }}>
        <h3 style={{ margin: "0 0 20px", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", color: "#2D3030" }}>Log Workout</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {WORKOUT_TYPES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
              padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: "'Jost', sans-serif", letterSpacing: "0.06em",
              background: form.type === t ? "#4A5240" : "rgba(196,169,154,0.2)",
              color: form.type === t ? "#F5EFE8" : "rgba(45,48,48,0.5)",
              transition: "all 0.2s"
            }}>{t}</button>
          ))}
        </div>
        <textarea
          placeholder="Notes (exercises, sets, how you felt...)"
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20, color: "rgba(45,48,48,0.7)", fontSize: 13 }}>
          <input type="checkbox" checked={form.done} onChange={e => setForm(f => ({ ...f, done: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: "#5C7260" }} />
          Mark as completed
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...btnStyle, background: "rgba(196,169,154,0.2)", color: "#2D3030", flex: 1 }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ ...btnStyle, background: "#4A5240", color: "#F5EFE8", flex: 2, fontWeight: 700 }}>Save Workout</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function WellnessTracker() {
  const [tab, setTab] = useState("dashboard");
  const [dayData, setDayData] = useState(() => loadDay(todayKey()) || getDefaultDayData());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [stepsInput, setStepsInput] = useState("");

  // Persist on change
  useEffect(() => { saveDay(todayKey(), dayData); }, [dayData]);

  // ── derived macros ──
  const totals = dayData.foodLog.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
      fiber: acc.fiber + f.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // ── helpers ──
  function toggleCheck(id) {
    setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  }
  function addWater(n) {
    setDayData(d => ({ ...d, water: Math.max(0, Math.min(d.water + n, 15)) }));
  }
  function addFood(entry) {
    setDayData(d => ({ ...d, foodLog: [...d.foodLog, entry] }));
  }
  function removeFood(id) {
    setDayData(d => ({ ...d, foodLog: d.foodLog.filter(f => f.id !== id) }));
  }
  function saveWorkout(w) {
    setDayData(d => ({ ...d, workout: w }));
    if (w.done) {
      setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "workout" ? { ...i, done: true } : i) }));
    }
  }
  function logSteps() {
    const s = parseInt(stepsInput);
    if (!isNaN(s) && s > 0) {
      setDayData(d => ({ ...d, steps: s }));
      setStepsInput("");
      if (s >= GOALS.steps) {
        setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "steps" ? { ...i, done: true } : i) }));
      }
    }
  }

  // Auto-check protein goal
  useEffect(() => {
    if (totals.protein >= GOALS.protein) {
      setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "protein" ? { ...i, done: true } : i) }));
    }
    if (dayData.water >= GOALS.water) {
      setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "water" ? { ...i, done: true } : i) }));
    }
    if (dayData.foodLog.length > 0) {
      setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "journal" ? { ...i, done: true } : i) }));
    }
  }, [totals.protein, dayData.water, dayData.foodLog.length]);

  const doneCount = dayData.checklist.filter(i => i.done).length;
  const totalCount = dayData.checklist.length;

  // Group food by meal
  const mealGroups = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── STYLES ──
  const S = {
    app: {
      minHeight: "100vh",
      background: C.cream,
      color: C.midnight,
      fontFamily: "'Jost', sans-serif",
      paddingBottom: 88,
    },
    header: {
      padding: "36px 22px 0",
      background: C.midnight,
      paddingBottom: 0,
    },
    greeting: {
      fontSize: 11, color: "rgba(237,228,220,0.5)", fontWeight: 500,
      letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 38, fontWeight: 300, letterSpacing: "-0.01em",
      color: C.peony, lineHeight: 1.1, marginBottom: 2,
      fontStyle: "italic"
    },
    date: { fontSize: 11, color: "rgba(237,228,220,0.35)", letterSpacing: "0.12em", marginBottom: 22, textTransform: "uppercase" },
    tabs: { display: "flex", gap: 0, borderTop: `1px solid rgba(237,228,220,0.08)`, marginTop: 4 },
    tab: (active) => ({
      flex: 1, padding: "12px 4px", border: "none", cursor: "pointer",
      fontSize: 9, fontWeight: 600, fontFamily: "'Jost', sans-serif",
      letterSpacing: "0.14em", textTransform: "uppercase",
      background: "transparent",
      color: active ? C.parchment : "rgba(237,228,220,0.28)",
      borderBottom: active ? `2px solid ${C.grape}` : "2px solid transparent",
      transition: "all 0.25s"
    }),
    body: { padding: "18px 16px" },
    card: {
      background: C.white,
      border: `1px solid rgba(196,169,154,0.2)`,
      borderRadius: 16,
      padding: "18px 18px",
      marginBottom: 12,
      boxShadow: "0 2px 12px rgba(45,48,48,0.06)",
    },
    cardTitle: {
      fontSize: 9, fontWeight: 600, letterSpacing: "0.18em",
      textTransform: "uppercase", color: C.parchment, marginBottom: 14
    },
    sectionBtn: {
      background: C.peony, border: `1px solid rgba(196,169,154,0.3)`,
      borderRadius: 10, padding: "10px 16px", color: C.midnight, cursor: "pointer",
      fontSize: 12, fontWeight: 600, fontFamily: "'Jost', sans-serif",
      letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8,
      transition: "all 0.2s"
    }
  };

  return (
    <div style={S.app}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: rgba(45,48,48,0.3); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(196,169,154,0.3); border-radius: 4px; }
        body { background: ${C.cream}; }
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={S.greeting}>Your wellness sanctuary</div>
        <div style={S.title}>Hello, Emily.</div>
        <div style={S.date}>{today}</div>
        <div style={S.tabs}>
          {[["dashboard","Dashboard"],["food","Food Journal"],["workout","Workout"],["checklist","Daily Wins"]].map(([id, label]) => (
            <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={S.body}>

        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {tab === "dashboard" && (
          <>
            {/* Daily Progress */}
            <div style={{ ...S.card, background: C.midnight, border: "none" }}>
              <div style={{ ...S.cardTitle, color: "rgba(237,228,220,0.4)" }}>Today's Progress</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: C.peony, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {doneCount}<span style={{ fontSize: 24, color: "rgba(237,228,220,0.25)", fontWeight: 300 }}>/{totalCount}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(237,228,220,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>daily wins</div>
                </div>
                <div style={{ position: "relative" }}>
                  <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(237,228,220,0.08)" strokeWidth={5} />
                    <circle cx={36} cy={36} r={30} fill="none" stroke={C.grape} strokeWidth={5}
                      strokeDasharray={`${(doneCount/totalCount)*188} 188`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.5s" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: C.grape, letterSpacing: "0.05em" }}>
                    {Math.round((doneCount/totalCount)*100)}%
                  </div>
                </div>
              </div>
              {/* Quick checklist preview */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dayData.checklist.map(item => (
                  <div key={item.id} style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 500,
                    letterSpacing: "0.06em",
                    background: item.done ? "rgba(155,107,114,0.2)" : "rgba(237,228,220,0.06)",
                    color: item.done ? C.grape : "rgba(237,228,220,0.3)",
                    border: `1px solid ${item.done ? "rgba(155,107,114,0.35)" : "rgba(237,228,220,0.08)"}`,
                    transition: "all 0.3s"
                  }}>
                    {item.icon} {item.label.split(" ").slice(0,2).join(" ")}
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Rings */}
            <div style={S.card}>
              <div style={S.cardTitle}>Macros Today</div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
                <Ring value={totals.calories} max={GOALS.calories} color={MACRO_COLORS.calories} label="Cals" sub="" size={78} />
                <Ring value={totals.protein} max={GOALS.protein} color={MACRO_COLORS.protein} label="Protein" sub="g" size={78} />
                <Ring value={totals.carbs} max={GOALS.carbs} color={MACRO_COLORS.carbs} label="Carbs" sub="g" size={78} />
                <Ring value={totals.fat} max={GOALS.fat} color={MACRO_COLORS.fat} label="Fat" sub="g" size={78} />
                <Ring value={totals.fiber} max={GOALS.fiber} color={MACRO_COLORS.fiber} label="Fiber" sub="g" size={78} />
              </div>
            </div>
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={S.cardTitle}>HydroJug Tracker</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: C.olive }}>
                  {dayData.water * 32}<span style={{ fontSize: 13, color: C.parchment, fontWeight: 300 }}>/{GOALS.water * 32} oz</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.parchment, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>Each jug = 32 oz · Goal: {GOALS.water} jugs</div>

              {/* Big jug visuals */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 18 }}>
                {Array.from({ length: GOALS.water }).map((_, i) => {
                  const filled = i < dayData.water;
                  return (
                    <div key={i} onClick={() => setDayData(d => ({ ...d, water: i + 1 }))} style={{ cursor: "pointer", textAlign: "center" }}>
                      <div style={{
                        width: 72, height: 96, borderRadius: "12px 12px 16px 16px",
                        border: `2px solid ${filled ? C.olive : "rgba(196,169,154,0.3)"}`,
                        background: filled
                          ? `linear-gradient(180deg, rgba(74,82,64,0.15) 0%, rgba(74,82,64,0.06) 100%)`
                          : C.peony,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "flex-end", paddingBottom: 10,
                        position: "relative", overflow: "hidden", transition: "all 0.3s"
                      }}>
                        {filled && (
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            height: "70%", background: "rgba(74,82,64,0.1)",
                            borderRadius: "0 0 14px 14px"
                          }} />
                        )}
                        <div style={{ fontSize: 28, position: "relative" }}>{filled ? "🫧" : "🫙"}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: filled ? C.olive : C.parchment, marginTop: 4, position: "relative", letterSpacing: "0.04em" }}>
                          {filled ? "32 oz" : "empty"}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: C.parchment, marginTop: 5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Jug {i + 1}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => addWater(-1)} style={{ ...S.sectionBtn, flex: 1, justifyContent: "center", fontSize: 18 }}>−</button>
                <button onClick={() => addWater(1)} style={{
                  ...S.sectionBtn, flex: 2, justifyContent: "center",
                  background: `rgba(74,82,64,0.1)`, borderColor: `rgba(74,82,64,0.25)`,
                  color: C.olive, fontWeight: 600, letterSpacing: "0.08em", fontSize: 11, textTransform: "uppercase"
                }}>+ 1 HydroJug (32 oz)</button>
              </div>
            </div>

            {/* Steps */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={S.cardTitle}>Steps</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: C.midnight }}>
                  {dayData.steps.toLocaleString()}
                  <span style={{ fontSize: 13, color: C.parchment, fontWeight: 300 }}>/{GOALS.steps.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ background: C.peony, borderRadius: 8, height: 6, marginBottom: 14, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: Math.min((dayData.steps / GOALS.steps) * 100, 100) + "%",
                  background: `linear-gradient(90deg, ${C.olive}, ${C.coffee})`,
                  transition: "width 0.5s"
                }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number" placeholder="Enter today's steps..."
                  value={stepsInput} onChange={e => setStepsInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && logSteps()}
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                />
                <button onClick={logSteps} style={{ ...btnStyle, background: C.olive, color: C.cream, padding: "11px 18px", fontSize: 12, letterSpacing: "0.08em" }}>Log</button>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ FOOD JOURNAL ═══════════════ */}
        {tab === "food" && (
          <>
            {/* Remaining macros banner */}
            <div style={{ ...S.card, background: C.midnight, border: "none" }}>
              <div style={{ ...S.cardTitle, color: "rgba(237,228,220,0.4)" }}>Remaining Today</div>
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                {[
                  { label: "Cals", val: GOALS.calories - totals.calories, color: C.parchment },
                  { label: "Protein", val: GOALS.protein - totals.protein, color: C.grape, unit: "g" },
                  { label: "Carbs", val: GOALS.carbs - totals.carbs, color: C.coffee, unit: "g" },
                  { label: "Fat", val: GOALS.fat - totals.fat, color: C.olive, unit: "g" },
                  { label: "Fiber", val: GOALS.fiber - totals.fiber, color: "#8FA68C", unit: "g" },
                ].map(({ label, val, color, unit = "" }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: val < 0 ? C.grape : color }}>
                      {val < 0 ? "+" : ""}{Math.abs(Math.round(val))}{unit}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(237,228,220,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
                      {val < 0 ? "over" : "left"}<br />{label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro bars */}
            <div style={S.card}>
              <div style={S.cardTitle}>Macro Progress</div>
              <MacroBar label="Calories" value={totals.calories} goal={GOALS.calories} color={MACRO_COLORS.calories} unit="" />
              <MacroBar label="Protein" value={totals.protein} goal={GOALS.protein} color={MACRO_COLORS.protein} />
              <MacroBar label="Carbs" value={totals.carbs} goal={GOALS.carbs} color={MACRO_COLORS.carbs} />
              <MacroBar label="Fat" value={totals.fat} goal={GOALS.fat} color={MACRO_COLORS.fat} />
              <MacroBar label="Fiber" value={totals.fiber} goal={GOALS.fiber} color={MACRO_COLORS.fiber} />
            </div>

            <button onClick={() => setShowFoodModal(true)} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: `1.5px dashed rgba(155,107,114,0.4)`,
              background: "rgba(155,107,114,0.05)", color: C.grape, fontFamily: "'Jost', sans-serif",
              fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 12,
              letterSpacing: "0.1em", textTransform: "uppercase"
            }}>+ Log Food</button>

            {/* Food by meal */}
            {mealGroups.map(meal => {
              const items = dayData.foodLog.filter(f => f.meal === meal);
              if (items.length === 0) return null;
              const mealTotals = items.reduce((a, f) => ({
                calories: a.calories + f.calories,
                protein: a.protein + f.protein,
              }), { calories: 0, protein: 0 });
              return (
                <div key={meal} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, fontStyle: "italic", color: C.midnight }}>{meal}</div>
                    <div style={{ fontSize: 10, color: C.parchment, letterSpacing: "0.08em" }}>
                      {Math.round(mealTotals.calories)} cal · {Math.round(mealTotals.protein)}g protein
                    </div>
                  </div>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 12px", borderRadius: 10, background: C.peony,
                      marginBottom: 6, border: `1px solid rgba(196,169,154,0.2)`
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.midnight }}>{item.name}</div>
                        <div style={{ fontSize: 10, color: C.parchment, marginTop: 2, letterSpacing: "0.04em" }}>
                          <span style={{ color: C.grape }}>{item.protein}g P</span>
                          {" · "}
                          <span style={{ color: C.coffee }}>{item.carbs}g C</span>
                          {" · "}
                          <span style={{ color: C.olive }}>{item.fat}g F</span>
                          {item.fiber > 0 && <span> · <span style={{ color: "#8FA68C" }}>{item.fiber}g Fib</span></span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.midnight }}>{item.calories}</div>
                        <button onClick={() => removeFood(item.id)} style={{
                          background: "none", border: "none", color: C.parchment,
                          cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1
                        }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {dayData.foodLog.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.parchment }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontStyle: "italic", marginBottom: 8, color: C.parchment, opacity: 0.4 }}>empty</div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.parchment }}>No food logged yet</div>
                <div style={{ fontSize: 12, marginTop: 4, color: C.parchment, opacity: 0.6 }}>Tap + Log Food to get started</div>
              </div>
            )}
          </>
        )}

        {tab === "workout" && (
          <>
            <div style={S.card}>
              <div style={S.cardTitle}>Today's Workout</div>
              {dayData.workout.type ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      padding: "7px 18px", borderRadius: 20, fontWeight: 600, fontSize: 13,
                      letterSpacing: "0.08em",
                      background: `rgba(74,82,64,0.12)`, color: C.olive,
                      border: `1px solid rgba(74,82,64,0.25)`
                    }}>{dayData.workout.type}</div>
                    {dayData.workout.done && (
                      <div style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                        letterSpacing: "0.08em",
                        background: `rgba(92,114,96,0.12)`, color: C.coffee,
                        border: `1px solid rgba(92,114,96,0.25)`
                      }}>✓ Completed</div>
                    )}
                  </div>
                  {dayData.workout.notes && (
                    <div style={{ background: C.peony, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: C.midnight, lineHeight: 1.6, marginBottom: 14, fontStyle: "italic" }}>
                      {dayData.workout.notes}
                    </div>
                  )}
                  <button onClick={() => setShowWorkoutModal(true)} style={{ ...S.sectionBtn, width: "100%", justifyContent: "center" }}>Edit Workout</button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontStyle: "italic", color: C.parchment, opacity: 0.4, marginBottom: 10 }}>lift.</div>
                  <div style={{ fontWeight: 500, marginBottom: 6, color: C.midnight, fontSize: 14 }}>No workout logged yet</div>
                  <div style={{ fontSize: 12, color: C.parchment, marginBottom: 20, letterSpacing: "0.06em" }}>Track your Push, Pull, Lower A or B session</div>
                  <button onClick={() => setShowWorkoutModal(true)} style={{ ...btnStyle, background: C.midnight, color: C.peony, padding: "12px 32px", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>Log Workout</button>
                </div>
              )}
            </div>

            {/* Workout split reference */}
            <div style={S.card}>
              <div style={S.cardTitle}>Your Weekly Split</div>
              {[
                { day: "Monday", type: "Push", desc: "Chest · Shoulders · Triceps" },
                { day: "Tuesday", type: "Pull", desc: "Back · Biceps · Rear Delts" },
                { day: "Wednesday", type: "Rest / Active Recovery", desc: "Walk · Stretch · Foam Roll" },
                { day: "Thursday", type: "Lower A", desc: "Squat Focus · Quads · Glutes" },
                { day: "Friday", type: "Lower B", desc: "Hinge Focus · Hamstrings · Glutes" },
                { day: "Sat / Sun", type: "Rest", desc: "Recovery · Family Time" },
              ].map(({ day, type, desc }) => {
                const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day;
                return (
                  <div key={day} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: 10, marginBottom: 6,
                    background: isToday ? `rgba(74,82,64,0.1)` : C.peony,
                    border: `1px solid ${isToday ? "rgba(74,82,64,0.25)" : "rgba(196,169,154,0.2)"}`
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isToday ? C.olive : C.midnight, letterSpacing: "0.05em" }}>{day}</div>
                      <div style={{ fontSize: 11, color: C.parchment, marginTop: 2 }}>{desc}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: isToday ? C.olive : C.parchment }}>{type}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "checklist" && (
          <>
            <div style={{ ...S.card, background: C.midnight, border: "none", textAlign: "center", paddingTop: 28, paddingBottom: 28 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, color: C.peony, lineHeight: 1, letterSpacing: "-0.03em", fontStyle: "italic" }}>
                {doneCount}<span style={{ fontSize: 32, color: "rgba(237,228,220,0.2)", fontWeight: 300 }}>/{totalCount}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(237,228,220,0.35)", marginTop: 6, letterSpacing: "0.16em", textTransform: "uppercase" }}>daily wins</div>
              {doneCount === totalCount && (
                <div style={{ marginTop: 14, fontSize: 12, fontWeight: 500, color: C.coffee, letterSpacing: "0.1em", textTransform: "uppercase" }}>You crushed today ✦</div>
              )}
            </div>

            <div style={S.card}>
              {dayData.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                    padding: "13px 12px", borderRadius: 12, marginBottom: 6,
                    background: item.done ? `rgba(92,114,96,0.08)` : C.peony,
                    border: `1px solid ${item.done ? "rgba(92,114,96,0.2)" : "rgba(196,169,154,0.2)"}`,
                    transition: "all 0.25s"
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `1.5px solid ${item.done ? C.coffee : "rgba(196,169,154,0.4)"}`,
                    background: item.done ? C.coffee : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.25s", fontSize: 11, color: C.cream
                  }}>
                    {item.done && "✓"}
                  </div>
                  <div style={{ fontSize: 15 }}>{item.icon}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
                    color: item.done ? C.coffee : C.midnight,
                    textDecoration: item.done ? "line-through" : "none",
                    opacity: item.done ? 0.65 : 1,
                    transition: "all 0.25s"
                  }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, background: "rgba(155,107,114,0.06)", border: `1px solid rgba(155,107,114,0.15)` }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", color: C.grape, marginBottom: 8 }}>A note for you —</div>
              <div style={{ fontSize: 13, color: C.midnight, lineHeight: 1.8, opacity: 0.7 }}>
                Protein first. Steps daily. Lift heavy. Sleep well.<br />
                <span style={{ color: C.grape, fontStyle: "italic" }}>You're building the life you want, one day at a time.</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.midnight,
        borderTop: `1px solid rgba(237,228,220,0.08)`,
        display: "flex", padding: "10px 8px 18px"
      }}>
        {[
          ["dashboard","○","Overview"],
          ["food","◇","Food"],
          ["workout","△","Workout"],
          ["checklist","□","Wins"],
        ].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 4px", borderRadius: 10,
            color: tab === id ? C.parchment : "rgba(237,228,220,0.25)",
            transition: "all 0.2s", fontFamily: "'Jost', sans-serif"
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</span>
          </button>
        ))}
      </div>

      {showFoodModal && <FoodModal onAdd={addFood} onClose={() => setShowFoodModal(false)} />}
      {showWorkoutModal && <WorkoutModal workout={dayData.workout} onSave={saveWorkout} onClose={() => setShowWorkoutModal(false)} />}
    </div>
  );
}
