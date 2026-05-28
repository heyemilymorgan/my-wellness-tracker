import { useState, useEffect } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  midnight:  "#7C4D4C",   // Blushed Earth — header, nav, dark cards (warm, not too dark)
  olive:     "#7C735B",   // Sagebound — secondary accent / progress
  coffee:    "#A3998E",   // Feathers — soft greige for checks/done states
  grape:     "#A2726D",   // Rose Bare — primary accent (rings, highlights)
  parchment: "#C1A298",   // Nude Ember — labels, muted text
  peony:     "#F1EEE9",   // soft tile inside cards (lighter than bg for layering)
  cream:     "#E9E5DE",   // Silk Ivory — main app background
  white:     "#FFFFFF",
  honey:     "#9E7944",   // Honey Gold — optional warm accent
  burgundy:  "#42201F",   // Burgundy — deepest tone for key text
};

const GOALS = { water: 3 };

// ─── 5-WEEK DEFICIT PROGRAM ───────────────────────────────────────────────────
const PROGRAM = {
  weeks: [
    {
      week: 1, theme: "Primer — Find Your Weights", calories: 1800,
      days: {
        Push: {
          note: "Find a weight you could do 3 more reps with. Log it — we'll build from here.",
          exercises: [
            { name: "Barbell Bench Press",       sets: 3, reps: "10",       cue: "Full ROM, pause at chest" },
            { name: "Dumbbell Shoulder Press",   sets: 3, reps: "10",       cue: "Control the descent" },
            { name: "Cable Lateral Raise",       sets: 3, reps: "12",       cue: "Lead with elbow, not wrist" },
            { name: "Tricep Rope Pushdown",      sets: 3, reps: "12",       cue: "Elbows pinned to sides" },
            { name: "Overhead Tricep Extension", sets: 3, reps: "12",       cue: "Full stretch at top" },
          ],
        },
        Pull: {
          note: "Focus on feeling the muscle, not just moving weight.",
          exercises: [
            { name: "Barbell Row",               sets: 3, reps: "10",       cue: "Drive elbows back, squeeze" },
            { name: "Lat Pulldown",              sets: 3, reps: "10",       cue: "Pull to upper chest, full stretch" },
            { name: "Cable Row (Seated)",        sets: 3, reps: "12",       cue: "No swinging, control eccentric" },
            { name: "Face Pull",                 sets: 3, reps: "15",       cue: "Elbows high, external rotation" },
            { name: "Dumbbell Curl",             sets: 3, reps: "12",       cue: "Supinate at top" },
          ],
        },
        "Lower A": {
          note: "Lower A is quad-dominant. Brace hard and push the floor away.",
          exercises: [
            { name: "Barbell Back Squat",        sets: 3, reps: "8",        cue: "Hip crease below parallel" },
            { name: "Leg Press",                 sets: 3, reps: "12",       cue: "Feet shoulder-width, full ROM" },
            { name: "Walking Lunge",             sets: 3, reps: "10 each",  cue: "Tall torso, big step" },
            { name: "Leg Extension",             sets: 3, reps: "15",       cue: "Pause at top, slow down" },
            { name: "Seated Calf Raise",         sets: 4, reps: "15",       cue: "Full stretch at bottom" },
          ],
        },
        "Lower B": {
          note: "Lower B is hinge-dominant. Hips back, bar close to body.",
          exercises: [
            { name: "Romanian Deadlift",         sets: 3, reps: "10",       cue: "Feel hamstring stretch, not low back" },
            { name: "Hip Thrust",                sets: 3, reps: "12",       cue: "Drive through heel, full extension" },
            { name: "Leg Curl (Lying)",          sets: 3, reps: "12",       cue: "Curl all the way, don't cheat" },
            { name: "Bulgarian Split Squat",     sets: 3, reps: "10 each",  cue: "Front foot out far enough" },
            { name: "Standing Calf Raise",       sets: 4, reps: "15",       cue: "Slow eccentric, full ROM" },
          ],
        },
      },
    },
    {
      week: 2, theme: "Build — Add 5 lbs or 1 Rep", calories: 1800,
      days: {
        Push: {
          note: "Add 5 lbs to bench and shoulder press vs Week 1, or squeeze out an extra rep.",
          exercises: [
            { name: "Barbell Bench Press",       sets: 3, reps: "10-11",    cue: "Try to add 5 lbs from W1" },
            { name: "Dumbbell Shoulder Press",   sets: 3, reps: "10-11",    cue: "Add 2.5 lbs each side if possible" },
            { name: "Cable Lateral Raise",       sets: 3, reps: "13",       cue: "Slow and controlled" },
            { name: "Tricep Rope Pushdown",      sets: 3, reps: "13",       cue: "Full extension every rep" },
            { name: "Overhead Tricep Extension", sets: 3, reps: "13",       cue: "Long head stretch" },
          ],
        },
        Pull: {
          note: "Same goal — more weight or more reps than Week 1.",
          exercises: [
            { name: "Barbell Row",               sets: 3, reps: "10-11",    cue: "Add 5 lbs if W1 felt easy" },
            { name: "Lat Pulldown",              sets: 3, reps: "11",       cue: "Try slightly more weight" },
            { name: "Cable Row (Seated)",        sets: 3, reps: "13",       cue: "Chest up through the pull" },
            { name: "Face Pull",                 sets: 3, reps: "15",       cue: "External rotation emphasis" },
            { name: "Dumbbell Curl",             sets: 3, reps: "13",       cue: "No swinging" },
          ],
        },
        "Lower A": {
          note: "Add 5–10 lbs to squat. Trust your body.",
          exercises: [
            { name: "Barbell Back Squat",        sets: 3, reps: "8",        cue: "Same depth, more weight" },
            { name: "Leg Press",                 sets: 3, reps: "13",       cue: "Heavier than W1" },
            { name: "Walking Lunge",             sets: 3, reps: "11 each",  cue: "Add light dumbbells if ready" },
            { name: "Leg Extension",             sets: 3, reps: "15",       cue: "Add a plate if W1 was easy" },
            { name: "Seated Calf Raise",         sets: 4, reps: "15",       cue: "Pause at stretch" },
          ],
        },
        "Lower B": {
          note: "5–10 lbs more on RDL and hip thrust.",
          exercises: [
            { name: "Romanian Deadlift",         sets: 3, reps: "11",       cue: "Controlled descent, no bounce" },
            { name: "Hip Thrust",                sets: 3, reps: "13",       cue: "More weight, same squeeze" },
            { name: "Leg Curl (Lying)",          sets: 3, reps: "13",       cue: "Don't let hips rise" },
            { name: "Bulgarian Split Squat",     sets: 3, reps: "11 each",  cue: "Add 5 lbs if stable" },
            { name: "Standing Calf Raise",       sets: 4, reps: "15",       cue: "Full ROM always" },
          ],
        },
      },
    },
    {
      week: 3, theme: "Push — Volume Increase", calories: 1650,
      days: {
        Push: {
          note: "Cut officially starts. Energy may dip mid-week — that's normal. Stay the course.",
          exercises: [
            { name: "Barbell Bench Press",       sets: 4, reps: "8",        cue: "Extra set — maintain W2 weight" },
            { name: "Incline DB Press",          sets: 3, reps: "10",       cue: "New movement — upper chest" },
            { name: "Cable Lateral Raise",       sets: 4, reps: "12",       cue: "Extra set for shoulder detail" },
            { name: "Tricep Rope Pushdown",      sets: 3, reps: "12",       cue: "Squeeze hard at lockout" },
            { name: "Overhead Tricep Extension", sets: 3, reps: "12",       cue: "Keep upper arms stationary" },
          ],
        },
        Pull: {
          note: "4 sets on the big lifts. Maintain weight from W2.",
          exercises: [
            { name: "Barbell Row",               sets: 4, reps: "8",        cue: "Extra set, same weight as W2" },
            { name: "Lat Pulldown",              sets: 4, reps: "10",       cue: "Full stretch, full contraction" },
            { name: "Cable Row (Seated)",        sets: 3, reps: "12",       cue: "Squeeze at the end of each rep" },
            { name: "Face Pull",                 sets: 3, reps: "15",       cue: "Protect those shoulders" },
            { name: "Hammer Curl",               sets: 3, reps: "12",       cue: "Brachialis emphasis, neutral grip" },
          ],
        },
        "Lower A": {
          note: "4 sets on squat. This is where you hold your muscle through the cut.",
          exercises: [
            { name: "Barbell Back Squat",        sets: 4, reps: "8",        cue: "4th set is hard — push it" },
            { name: "Leg Press",                 sets: 3, reps: "12",       cue: "Maintain W2 weight" },
            { name: "Walking Lunge",             sets: 3, reps: "12 each",  cue: "Slow eccentric, 2 sec down" },
            { name: "Leg Extension",             sets: 3, reps: "15",       cue: "Squeeze at top for 1 sec" },
            { name: "Seated Calf Raise",         sets: 4, reps: "15",       cue: "Loaded stretch" },
          ],
        },
        "Lower B": {
          note: "4 sets on RDL. Hamstrings are your secret weapon.",
          exercises: [
            { name: "Romanian Deadlift",         sets: 4, reps: "10",       cue: "4th set should be a grind" },
            { name: "Hip Thrust",                sets: 4, reps: "12",       cue: "Extra set — glutes need volume" },
            { name: "Leg Curl (Lying)",          sets: 3, reps: "12",       cue: "Full ROM, no cheating" },
            { name: "Bulgarian Split Squat",     sets: 3, reps: "10 each",  cue: "Hold top for 1 sec" },
            { name: "Standing Calf Raise",       sets: 4, reps: "15",       cue: "Extra slow eccentric" },
          ],
        },
      },
    },
    {
      week: 4, theme: "Intensify — Keep Pushing", calories: 1650,
      days: {
        Push: {
          note: "You're 4 weeks in. Fatigue may be real. Focus on technique over ego.",
          exercises: [
            { name: "Barbell Bench Press",       sets: 4, reps: "8-9",      cue: "Beat W3 by a rep or 2.5 lbs" },
            { name: "Incline DB Press",          sets: 3, reps: "11",       cue: "Add weight if W3 felt easy" },
            { name: "Cable Lateral Raise",       sets: 4, reps: "13",       cue: "1 more rep per set than W3" },
            { name: "Tricep Rope Pushdown",      sets: 3, reps: "13",       cue: "Heavier than W3" },
            { name: "Overhead Tricep Extension", sets: 3, reps: "13",       cue: "Long-head stretch is key" },
          ],
        },
        Pull: {
          note: "Back thickness comes from rows. Don't skip the squeeze.",
          exercises: [
            { name: "Barbell Row",               sets: 4, reps: "9",        cue: "Add 5 lbs or 1 rep vs W3" },
            { name: "Lat Pulldown",              sets: 4, reps: "11",       cue: "Extra rep each set" },
            { name: "Cable Row (Seated)",        sets: 3, reps: "13",       cue: "More weight than W3" },
            { name: "Face Pull",                 sets: 3, reps: "15",       cue: "Same weight, perfect form" },
            { name: "Hammer Curl",               sets: 3, reps: "13",       cue: "Add 2.5 lbs if possible" },
          ],
        },
        "Lower A": {
          note: "Squatting in a deficit is hard. You're doing it anyway. That's the difference.",
          exercises: [
            { name: "Barbell Back Squat",        sets: 4, reps: "9",        cue: "Beat W3 — that's the goal" },
            { name: "Leg Press",                 sets: 3, reps: "13",       cue: "One more rep than W3" },
            { name: "Walking Lunge",             sets: 3, reps: "12 each",  cue: "Add light dumbbells" },
            { name: "Leg Extension",             sets: 3, reps: "15",       cue: "Add a plate vs W3" },
            { name: "Seated Calf Raise",         sets: 4, reps: "15",       cue: "Controlled stretch" },
          ],
        },
        "Lower B": {
          note: "Glutes respond to volume and squeeze. Give them both.",
          exercises: [
            { name: "Romanian Deadlift",         sets: 4, reps: "11",       cue: "5 lbs more than W3" },
            { name: "Hip Thrust",                sets: 4, reps: "13",       cue: "Add weight — these should burn" },
            { name: "Leg Curl (Lying)",          sets: 3, reps: "13",       cue: "Fight the weight on the way down" },
            { name: "Bulgarian Split Squat",     sets: 3, reps: "11 each",  cue: "Stay upright" },
            { name: "Standing Calf Raise",       sets: 4, reps: "15",       cue: "Full ROM" },
          ],
        },
      },
    },
    {
      week: 5, theme: "Peak — Prove What You've Built", calories: 1550,
      days: {
        Push: {
          note: "Final week. Leave nothing on the platform. You've earned every rep.",
          exercises: [
            { name: "Barbell Bench Press",       sets: 4, reps: "8",        cue: "Match or beat W4 weight" },
            { name: "Incline DB Press",          sets: 3, reps: "12",       cue: "Strongest set of the program" },
            { name: "Cable Lateral Raise",       sets: 4, reps: "12",       cue: "Perfect form, heavier weight" },
            { name: "Tricep Rope Pushdown",      sets: 3, reps: "12",       cue: "Heaviest of the program" },
            { name: "Overhead Tricep Extension", sets: 3, reps: "12",       cue: "Go to failure on last set" },
          ],
        },
        Pull: {
          note: "Last pull session. Make it count.",
          exercises: [
            { name: "Barbell Row",               sets: 4, reps: "8",        cue: "Heaviest row of the program" },
            { name: "Lat Pulldown",              sets: 4, reps: "10",       cue: "Best weight of the 5 weeks" },
            { name: "Cable Row (Seated)",        sets: 3, reps: "12",       cue: "Max contraction every rep" },
            { name: "Face Pull",                 sets: 3, reps: "15",       cue: "Shoulder health — don't skip" },
            { name: "Hammer Curl",               sets: 3, reps: "12",       cue: "Controlled, no swinging" },
          ],
        },
        "Lower A": {
          note: "Last squat day. This is who you are now.",
          exercises: [
            { name: "Barbell Back Squat",        sets: 4, reps: "8",        cue: "Best squat of the program" },
            { name: "Leg Press",                 sets: 3, reps: "12",       cue: "Heaviest leg press yet" },
            { name: "Walking Lunge",             sets: 3, reps: "12 each",  cue: "Heavy and controlled" },
            { name: "Leg Extension",             sets: 3, reps: "15",       cue: "Burn them out" },
            { name: "Seated Calf Raise",         sets: 4, reps: "15",       cue: "Don't skip calves — ever" },
          ],
        },
        "Lower B": {
          note: "Last hinge day. Finish strong.",
          exercises: [
            { name: "Romanian Deadlift",         sets: 4, reps: "10",       cue: "Heaviest RDL of the program" },
            { name: "Hip Thrust",                sets: 4, reps: "12",       cue: "Load it up — last chance" },
            { name: "Leg Curl (Lying)",          sets: 3, reps: "12",       cue: "Slow and deliberate" },
            { name: "Bulgarian Split Squat",     sets: 3, reps: "10 each",  cue: "Controlled, proud posture" },
            { name: "Standing Calf Raise",       sets: 4, reps: "15",       cue: "Full ROM to the end" },
          ],
        },
      },
    },
  ],
};

const DAY_MAP = { Monday: "Push", Tuesday: "Pull", Wednesday: null, Thursday: "Lower A", Friday: "Lower B", Saturday: null, Sunday: null };

const DEFAULT_CHECKLIST = [
  { id: "workout", label: "Complete workout",          icon: "🏋️", auto: true },
  { id: "steps",   label: "Hit 10,000 steps",          icon: "👟" },
  { id: "water",   label: "Drink 3 HydroJugs (96 oz)", icon: "💧", auto: true },
  { id: "protein", label: "Hit protein goal",          icon: "🥩" },
  { id: "fiber",   label: "Hit fiber goal (25g)",      icon: "🥦" },
  { id: "sleep",   label: "7 hours of sleep",          icon: "😴" },
];

function todayKey() { return new Date().toISOString().split("T")[0]; }
function loadDay(k) { try { return JSON.parse(localStorage.getItem("wt6_" + k) || "null"); } catch { return null; } }
function saveDay(k, d) { try { localStorage.setItem("wt6_" + k, JSON.stringify(d)); } catch {} }
function loadWLog() { try { return JSON.parse(localStorage.getItem("wt6_wlog") || "{}"); } catch { return {}; } }
function saveWLog(l) { try { localStorage.setItem("wt6_wlog", JSON.stringify(l)); } catch {} }
function getDefaultDay() { return { checklist: DEFAULT_CHECKLIST.map(i => ({ ...i, done: false })), water: 0 }; }

const iStyle = {
  width: "100%", boxSizing: "border-box", background: C.white,
  border: `1px solid rgba(196,169,154,0.3)`, borderRadius: 8,
  padding: "9px 10px", color: C.midnight, fontSize: 14,
  outline: "none", fontFamily: "'DM Sans', sans-serif",
};

function Btn({ children, bg, color, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
      fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "0.1em", textTransform: "uppercase",
      background: bg, color, transition: "all 0.2s", ...style
    }}>{children}</button>
  );
}

// ─── LIVE WORKOUT ─────────────────────────────────────────────────────────────
function LiveWorkout({ exercises, workoutKey, onClose, onComplete }) {
  const existing = loadWLog()[workoutKey] || {};
  const initSets = exercises.map((ex, ei) =>
    existing[ei] || Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }))
  );
  const [sets, setSets] = useState(initSets);
  const [activeEx, setActiveEx] = useState(0);
  const [restSecs, setRestSecs] = useState(0);
  const [resting, setResting] = useState(false);

  useEffect(() => {
    const log = loadWLog();
    log[workoutKey] = sets;
    saveWLog(log);
  }, [sets]);

  useEffect(() => {
    if (!resting || restSecs <= 0) { if (restSecs <= 0) setResting(false); return; }
    const t = setTimeout(() => setRestSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restSecs]);

  function update(ei, si, field, val) {
    setSets(p => p.map((ex, i) => i !== ei ? ex : ex.map((s, j) => j !== si ? s : { ...s, [field]: val })));
  }
  function toggleDone(ei, si) {
    setSets(p => p.map((ex, i) => i !== ei ? ex : ex.map((s, j) => {
      if (j !== si) return s;
      const nowDone = !s.done;
      if (nowDone) { setRestSecs(90); setResting(true); }
      return { ...s, done: nowDone };
    })));
  }

  const totalSets = sets.reduce((a, ex) => a + ex.length, 0);
  const doneSets  = sets.reduce((a, ex) => a + ex.filter(s => s.done).length, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.cream, zIndex: 200, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 }}>
      {/* Sticky header */}
      <div style={{ background: C.midnight, padding: "20px 18px 14px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontStyle: "italic", color: C.peony }}>Live Workout</div>
          <button onClick={onClose} style={{ background: "rgba(237,228,220,0.1)", border: "none", color: C.parchment, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>EXIT</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 4, marginBottom: 6 }}>
          <div style={{ height: "100%", borderRadius: 6, background: C.grape, width: `${(doneSets / totalSets) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 10, color: "rgba(237,228,220,0.4)", letterSpacing: "0.1em" }}>{doneSets} / {totalSets} SETS COMPLETE</div>
        {resting && restSecs > 0 && (
          <div style={{ marginTop: 10, background: "rgba(162,114,109,0.2)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: C.grape, fontWeight: 700, letterSpacing: "0.1em" }}>REST</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: C.peony }}>
              {Math.floor(restSecs / 60)}:{String(restSecs % 60).padStart(2, "0")}
            </div>
            <button onClick={() => { setResting(false); setRestSecs(0); }} style={{ background: "none", border: "none", color: C.parchment, cursor: "pointer", fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>SKIP</button>
          </div>
        )}
      </div>

      {/* Exercise pill nav */}
      <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "14px 18px 0", scrollbarWidth: "none" }}>
        {exercises.map((ex, i) => {
          const done = sets[i] && sets[i].every(s => s.done);
          return (
            <button key={i} onClick={() => setActiveEx(i)} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.07em",
              background: activeEx === i ? C.midnight : (done ? "rgba(163,153,142,0.15)" : C.peony),
              color: activeEx === i ? C.parchment : (done ? C.coffee : C.midnight),
            }}>
              {done ? "✓ " : ""}{ex.name.split(" ").slice(0, 2).join(" ")}
            </button>
          );
        })}
      </div>

      {/* Active exercise panel */}
      <div style={{ padding: "16px 18px" }}>
        {exercises.map((ex, ei) => ei !== activeEx ? null : (
          <div key={ei}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontStyle: "italic", color: C.midnight, marginBottom: 4 }}>{ex.name}</div>
              <div style={{ fontSize: 11, color: C.parchment, letterSpacing: "0.05em", marginBottom: 2 }}>💡 {ex.cue}</div>
              <div style={{ fontSize: 10, color: C.coffee, letterSpacing: "0.08em", textTransform: "uppercase" }}>{ex.sets} sets · {ex.reps} reps</div>
            </div>

            {/* Set table */}
            <div style={{ background: C.peony, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 40px", gap: 6, padding: "10px 14px", borderBottom: `1px solid rgba(196,169,154,0.3)` }}>
                {["SET", "WEIGHT", "REPS", "✓"].map(h => (
                  <div key={h} style={{ fontSize: 9, fontWeight: 700, color: C.parchment, letterSpacing: "0.12em" }}>{h}</div>
                ))}
              </div>
              {sets[ei] && sets[ei].map((s, si) => (
                <div key={si} style={{
                  display: "grid", gridTemplateColumns: "32px 1fr 1fr 40px", gap: 6,
                  padding: "9px 14px", alignItems: "center",
                  background: s.done ? "rgba(163,153,142,0.07)" : "transparent",
                  borderBottom: si < sets[ei].length - 1 ? `1px solid rgba(196,169,154,0.15)` : "none",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.done ? C.coffee : C.midnight }}>{si + 1}</div>
                  <input type="number" placeholder="lbs" value={s.weight}
                    onChange={e => update(ei, si, "weight", e.target.value)}
                    style={{ ...iStyle, background: s.done ? "rgba(163,153,142,0.08)" : C.white }} />
                  <input type="number" placeholder={ex.reps.split("-")[0]} value={s.reps}
                    onChange={e => update(ei, si, "reps", e.target.value)}
                    style={{ ...iStyle, background: s.done ? "rgba(163,153,142,0.08)" : C.white }} />
                  <button onClick={() => toggleDone(ei, si)} style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                    background: s.done ? C.coffee : "rgba(196,169,154,0.3)",
                    color: s.done ? C.cream : C.parchment, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✓</button>
                </div>
              ))}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", gap: 10 }}>
              {ei > 0 && <Btn bg={C.peony} color={C.midnight} onClick={() => setActiveEx(ei - 1)} style={{ flex: 1 }}>← Prev</Btn>}
              {ei < exercises.length - 1
                ? <Btn bg={C.midnight} color={C.peony} onClick={() => setActiveEx(ei + 1)} style={{ flex: 2 }}>Next →</Btn>
                : <Btn bg={doneSets === totalSets ? C.olive : "rgba(196,169,154,0.3)"} color={doneSets === totalSets ? C.cream : C.parchment} onClick={() => { if (doneSets === totalSets) { onComplete && onComplete(); onClose(); } }} style={{ flex: 2 }}>
                    {doneSets === totalSets ? "Finish Workout ✓" : `${totalSets - doneSets} sets left`}
                  </Btn>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROGRAM TAB ─────────────────────────────────────────────────────────────
function ProgramTab({ dayData, setDayData }) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [expandedDay, setExpandedDay]   = useState(null);
  const [liveWorkout, setLiveWorkout]   = useState(null);
  const workoutLog = loadWLog();
  const dayTypes   = ["Push", "Pull", "Lower A", "Lower B"];
  const todayName  = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayType  = DAY_MAP[todayName];
  const weekData   = PROGRAM.weeks[selectedWeek];

  function wKey(wi, dt) { return `w${wi + 1}_${dt.replace(/ /g, "_")}`; }
  function isDone(wi, dt) {
    const l = workoutLog[wKey(wi, dt)];
    return l && l.length > 0 && l.every(ex => Array.isArray(ex) && ex.length > 0 && ex.every(s => s.done));
  }
  function markWorkoutDone() {
    setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "workout" ? { ...i, done: true } : i) }));
  }

  if (liveWorkout) {
    return <LiveWorkout
      exercises={PROGRAM.weeks[liveWorkout.wi].days[liveWorkout.dt].exercises}
      workoutKey={wKey(liveWorkout.wi, liveWorkout.dt)}
      onClose={() => setLiveWorkout(null)}
      onComplete={markWorkoutDone}
    />;
  }

  return (
    <>
      {/* Today card */}
      <div style={{ background: C.midnight, border: "none", borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: "0 2px 12px rgba(45,48,48,0.08)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(237,228,220,0.4)", marginBottom: 10 }}>
          Today — {todayName}
        </div>
        {todayType ? (
          <>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, color: C.peony, marginBottom: 4 }}>{todayType}</div>
            <div style={{ fontSize: 11, color: "rgba(237,228,220,0.45)", marginBottom: 4, letterSpacing: "0.06em" }}>
              Week {selectedWeek + 1} · {weekData.theme}
            </div>
            <div style={{ fontSize: 11, color: C.parchment, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic", opacity: 0.8 }}>
              "{weekData.days[todayType].note}"
            </div>
            <Btn bg={C.grape} color={C.white} onClick={() => setLiveWorkout({ wi: selectedWeek, dt: todayType })} style={{ width: "100%", padding: "14px", fontSize: 12 }}>
              Start Workout →
            </Btn>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, color: C.peony, marginBottom: 8 }}>Rest Day</div>
            <div style={{ fontSize: 12, color: "rgba(237,228,220,0.4)", lineHeight: 1.7 }}>Walk. Stretch. Eat your protein. Recovery is part of the program.</div>
          </>
        )}
      </div>

      {/* Week selector */}
      <div style={{ background: C.white, border: `1px solid rgba(196,169,154,0.2)`, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: "0 2px 12px rgba(45,48,48,0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.parchment, marginBottom: 12 }}>5-Week Program</div>

        {/* Week pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {PROGRAM.weeks.map((w, i) => (
            <button key={i} onClick={() => setSelectedWeek(i)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em",
              background: selectedWeek === i ? C.midnight : C.peony,
              color: selectedWeek === i ? C.parchment : C.midnight, transition: "all 0.2s",
            }}>W{i + 1}</button>
          ))}
        </div>

        {/* Week summary */}
        <div style={{ padding: "12px 14px", background: C.peony, borderRadius: 12, marginBottom: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.midnight, marginBottom: 2 }}>Week {selectedWeek + 1}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.olive, letterSpacing: "0.06em" }}>{weekData.theme}</div>
          <div style={{ fontSize: 11, color: C.parchment, marginTop: 4 }}>~{weekData.calories} cal/day target</div>
        </div>

        {/* Day rows */}
        {dayTypes.map(dt => {
          const done = isDone(selectedWeek, dt);
          const exp  = expandedDay === `${selectedWeek}-${dt}`;
          const dd   = weekData.days[dt];
          return (
            <div key={dt} style={{ marginBottom: 8 }}>
              <div onClick={() => setExpandedDay(exp ? null : `${selectedWeek}-${dt}`)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", borderRadius: exp ? "12px 12px 0 0" : 12, cursor: "pointer",
                background: done ? "rgba(163,153,142,0.08)" : C.peony,
                border: `1px solid ${done ? "rgba(163,153,142,0.2)" : "rgba(196,169,154,0.2)"}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: done ? C.coffee : C.midnight }}>{done ? "✓ " : ""}{dt}</div>
                  <div style={{ fontSize: 10, color: C.parchment, marginTop: 2 }}>
                    {dd.exercises.length} exercises · {dd.exercises.reduce((a, e) => a + e.sets, 0)} sets
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Btn bg={C.midnight} color={C.peony} onClick={e => { e.stopPropagation(); setLiveWorkout({ wi: selectedWeek, dt }); }} style={{ padding: "6px 12px", fontSize: 9 }}>
                    Start
                  </Btn>
                  <span style={{ fontSize: 11, color: C.parchment }}>{exp ? "▲" : "▼"}</span>
                </div>
              </div>

              {exp && (
                <div style={{ background: C.white, border: `1px solid rgba(196,169,154,0.15)`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px" }}>
                  <div style={{ fontSize: 11, color: C.olive, fontStyle: "italic", marginBottom: 12, lineHeight: 1.6 }}>"{dd.note}"</div>
                  {dd.exercises.map((ex, i) => {
                    const log = workoutLog[wKey(selectedWeek, dt)];
                    const exLog = log && log[i];
                    const best = exLog ? exLog.filter(s => s.weight).sort((a, b) => +b.weight - +a.weight)[0] : null;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: i < dd.exercises.length - 1 ? `1px solid ${C.peony}` : "none" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.midnight }}>{ex.name}</div>
                          <div style={{ fontSize: 10, color: C.parchment, marginTop: 2 }}>{ex.sets} × {ex.reps} · {ex.cue}</div>
                        </div>
                        {best && (
                          <div style={{ textAlign: "right", marginLeft: 10, flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.olive }}>{best.weight} lbs</div>
                            <div style={{ fontSize: 10, color: C.parchment }}>{best.reps || ex.reps} reps</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── HOME TAB (Overview + Daily Wins merged) ──────────────────────────────────
function DashboardTab({ dayData, setDayData }) {
  const doneCount  = dayData.checklist.filter(i => i.done).length;
  const totalCount = dayData.checklist.length;
  function addWater(n) { setDayData(d => ({ ...d, water: Math.max(0, Math.min(d.water + n, 6)) })); }
  function toggle(id) { setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i) })); }

  return (
    <>
      {/* Progress ring card */}
      <div style={{ background: C.olive, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: "0 2px 12px rgba(124,115,91,0.18)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,238,233,0.5)", marginBottom: 12 }}>Today's Progress</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 58, fontWeight: 600, color: C.peony, lineHeight: 1 }}>
              {doneCount}<span style={{ fontSize: 28, color: "rgba(241,238,233,0.4)" }}>/{totalCount}</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(241,238,233,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>daily wins</div>
          </div>
          <div style={{ position: "relative" }}>
            <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(241,238,233,0.15)" strokeWidth={5} />
              <circle cx={36} cy={36} r={30} fill="none" stroke={C.peony} strokeWidth={5}
                strokeDasharray={`${(doneCount / totalCount) * 188} 188`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: C.peony }}>
              {Math.round((doneCount / totalCount) * 100)}%
            </div>
          </div>
        </div>
        {doneCount === totalCount && (
          <div style={{ marginTop: 14, fontFamily: "'Instrument Serif', serif", fontSize: 22, color: C.peony, textAlign: "center" }}>You crushed today ✦</div>
        )}
      </div>

      {/* Tappable checklist — front and center */}
      <div style={{ background: C.white, border: `1px solid rgba(196,169,154,0.2)`, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: "0 2px 12px rgba(78,87,67,0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.parchment, marginBottom: 14 }}>Daily Wins</div>
        {dayData.checklist.map(item => (
          <div key={item.id} onClick={() => toggle(item.id)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", padding: "13px 12px", borderRadius: 12, marginBottom: 6, background: item.done ? "rgba(163,153,142,0.12)" : C.peony, border: `1px solid ${item.done ? "rgba(163,153,142,0.3)" : "rgba(196,169,154,0.2)"}`, transition: "all 0.25s" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${item.done ? C.coffee : "rgba(196,169,154,0.4)"}`, background: item.done ? C.coffee : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.white, transition: "all 0.25s" }}>
              {item.done && "✓"}
            </div>
            <div style={{ fontSize: 15 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: item.done ? C.coffee : C.midnight, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.65 : 1, transition: "all 0.25s" }}>{item.label}</div>
            {item.auto && !item.done && (
              <div style={{ marginLeft: "auto", fontSize: 8, color: C.parchment, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>auto</div>
            )}
          </div>
        ))}
      </div>

      {/* HydroJug */}
      <div style={{ background: C.white, border: `1px solid rgba(196,169,154,0.2)`, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: "0 2px 12px rgba(78,87,67,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.parchment, marginBottom: 12 }}>HydroJug Tracker</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: C.olive }}>
            {dayData.water * 32}<span style={{ fontSize: 14, color: C.parchment }}>/{GOALS.water * 32} oz</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.parchment, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>32 oz per jug · Goal: {GOALS.water} jugs</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
          {Array.from({ length: GOALS.water }).map((_, i) => {
            const filled = i < dayData.water;
            return (
              <div key={i} onClick={() => setDayData(d => ({ ...d, water: i + 1 }))} style={{ cursor: "pointer", textAlign: "center" }}>
                <div style={{ width: 72, height: 92, borderRadius: "12px 12px 16px 16px", border: `2px solid ${filled ? C.olive : "rgba(196,169,154,0.3)"}`, background: filled ? "linear-gradient(180deg, rgba(124,115,91,0.18) 0%, rgba(124,115,91,0.07) 100%)" : C.peony, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 10, position: "relative", overflow: "hidden", transition: "all 0.3s" }}>
                  {filled && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "70%", background: "rgba(124,115,91,0.12)", borderRadius: "0 0 14px 14px" }} />}
                  <div style={{ fontSize: 26, position: "relative" }}>{filled ? "🫧" : "🫙"}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: filled ? C.olive : C.parchment, marginTop: 4, position: "relative" }}>{filled ? "32 oz" : "empty"}</div>
                </div>
                <div style={{ fontSize: 10, color: C.parchment, marginTop: 5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Jug {i + 1}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn bg={C.peony} color={C.midnight} onClick={() => addWater(-1)} style={{ flex: 1, padding: "10px" }}>−</Btn>
          <Btn bg="rgba(124,115,91,0.12)" color={C.olive} onClick={() => addWater(1)} style={{ flex: 2, border: `1px solid rgba(124,115,91,0.3)` }}>+ 1 HydroJug</Btn>
        </div>
      </div>

      {/* Note */}
      <div style={{ background: "rgba(162,114,109,0.06)", border: `1px solid rgba(162,114,109,0.15)`, borderRadius: 16, padding: 18 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: C.grape, marginBottom: 4 }}>A note for you —</div>
        <div style={{ fontSize: 13, color: C.midnight, lineHeight: 1.8, opacity: 0.75 }}>
          Protein first. Steps daily. Lift heavy. Sleep well.<br />
          <span style={{ color: C.grape }}>You're building the life you want, one day at a time.</span>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function WellnessTracker() {
  const [tab, setTab]         = useState("dashboard");
  const [dayData, setDayData] = useState(() => loadDay(todayKey()) || getDefaultDay());

  useEffect(() => { saveDay(todayKey(), dayData); }, [dayData]);
  useEffect(() => {
    if (dayData.water >= GOALS.water)
      setDayData(d => ({ ...d, checklist: d.checklist.map(i => i.id === "water" ? { ...i, done: true } : i) }));
  }, [dayData.water]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: C.cream, color: C.midnight, fontFamily: "'DM Sans', sans-serif", paddingBottom: 88 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(45,48,48,0.3); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(196,169,154,0.3); border-radius: 4px; }
        body { background: #E9E5DE; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.midnight, padding: "36px 22px 0" }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "rgba(237,228,220,0.6)", letterSpacing: "0.04em", marginBottom: 0 }}>Hebrews 12:11</div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 52, fontWeight: 600, color: C.peony, lineHeight: 1, marginBottom: 4 }}>Emily Habits</div>
        <div style={{ fontSize: 11, color: "rgba(237,228,220,0.35)", letterSpacing: "0.12em", marginBottom: 22, textTransform: "uppercase" }}>{today}</div>
        <div style={{ display: "flex", borderTop: `1px solid rgba(237,228,220,0.08)` }}>
          {[["dashboard", "Home"], ["program", "Program"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "12px 4px", border: "none", cursor: "pointer",
              fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent",
              color: tab === id ? C.parchment : "rgba(237,228,220,0.28)",
              borderBottom: tab === id ? `2px solid ${C.grape}` : "2px solid transparent",
              transition: "all 0.25s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "18px 16px" }}>
        {tab === "dashboard"  && <DashboardTab  dayData={dayData} setDayData={setDayData} />}
        {tab === "program"    && <ProgramTab dayData={dayData} setDayData={setDayData} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.midnight, borderTop: `1px solid rgba(237,228,220,0.08)`, display: "flex", padding: "10px 8px 18px" }}>
        {[["dashboard", "♡", "Home"], ["program", "△", "Program"]].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 4px", color: tab === id ? C.parchment : "rgba(237,228,220,0.25)",
            transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif"
          }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
