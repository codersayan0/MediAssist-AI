/* ═══════════════════════════════════════════
   MediAssist AI — results.js
═══════════════════════════════════════════ */

const data = JSON.parse(sessionStorage.getItem("mediassist_result") || "{}");
const resultType = sessionStorage.getItem("mediassist_type") || "report";

const ml  = data.ml_prediction    || {};
const rec = data.recommendations  || {};
const cbc = data.cbc_analysis     || {};
const ext = data.extracted_values || {};

const container = document.getElementById("resultsContainer");

/* ── DEBUG ─────────────────────────────── */
console.log("TYPE:", resultType);
console.log("DATA:", data);

/* ── HELPERS ───────────────────────────── */
function badge(text, type) {
  const colors = { high:"#A32D2D", medium:"#BA7517", low:"#3B6D11" };
  return `<span style="background:${colors[type]||'#888780'};color:#fff;
    padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">${text}</span>`;
}

function card(title, iconLetter, iconClass, content) {
  return `
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-title">
          <span class="result-card-icon ${iconClass}">${iconLetter}</span>
          ${title}
        </div>
      </div>
      ${content}
    </div>`;
}

function buildList(items, color = "#185FA5") {
  const clean = (items || []).filter(i => i && String(i).trim() !== "" && i !== "nan");
  if (!clean.length) return "<p style='font-size:13px;color:#B4B2A9'>No data available.</p>";
  return `<ul style="list-style:none;padding:0;margin:0">
    ${clean.map(i => `
      <li style="padding:7px 0;border-bottom:0.5px solid rgba(0,0,0,0.06);
        font-size:14px;display:flex;gap:8px;align-items:flex-start">
        <span style="width:6px;height:6px;border-radius:50%;background:${color};
          flex-shrink:0;margin-top:6px"></span>${i}
      </li>`).join("")}
  </ul>`;
}

let html = "";

/* ══════════════════════════════════════════
   SYMPTOM RESULTS
══════════════════════════════════════════ */
if (resultType === "symptoms") {

  if (!ml.disease) {
    html = `<div class="alert alert-warning">
      ⚠ No results found. Please check symptoms first.
    </div>`;
  } else {

    const top3Html = (ml.top3_predictions || []).map(p => `
      <div style="margin-bottom:6px;font-size:13px">
        ${p.disease} — ${p.confidence}%
      </div>`).join("");

    html += card("Disease Prediction", "D", "icon-blue", `
      <p><strong>${ml.disease}</strong> ${badge(ml.urgency, ml.urgency)}</p>
      <p>Severity Score: ${ml.severity_score}</p>
      ${top3Html}
    `);

    if (rec.medications?.length)
      html += card("Medicines", "M", "icon-teal", buildList(rec.medications));

    if (rec.diet?.length)
      html += card("Diet", "D", "icon-green", buildList(rec.diet));

    if (rec.precautions?.length)
      html += card("Precautions", "P", "icon-amber", buildList(rec.precautions));
  }

/* ══════════════════════════════════════════
   REPORT / CBC RESULTS
══════════════════════════════════════════ */
} else {

  if (!cbc.predicted_condition && !cbc.condition) {
    html = `<div class="alert alert-warning">
      ⚠ No CBC results found. Please upload or enter values.
    </div>`;
  } else {

    html += card("CBC Analysis", "C", "icon-blue", `
      <p><strong>Condition:</strong> ${cbc.predicted_condition || cbc.condition}</p>
      <p><strong>Abnormal Count:</strong> ${cbc.total_abnormal}</p>
    `);

    if (cbc.abnormal_flags?.length) {
      html += card("Abnormal Values", "!", "icon-red",
        buildList(cbc.abnormal_flags.map(f =>
          `${f.parameter}: ${f.value} (${f.status})`
        ), "#A32D2D")
      );
    }

    if (rec.medications?.length)
      html += card("Medicines", "M", "icon-teal", buildList(rec.medications));

    if (rec.diet?.length)
      html += card("Diet", "D", "icon-green", buildList(rec.diet));

    if (rec.precautions?.length)
      html += card("Precautions", "P", "icon-amber", buildList(rec.precautions));
  }
}

/* ── DISCLAIMER ───────────────────────── */
html += `
  <div style="background:#f7f6f2;padding:16px;font-size:12px;margin-top:10px">
    <strong>Disclaimer:</strong> Always consult a doctor.
  </div>`;

/* ── RENDER ───────────────────────────── */
if (container) {
  container.innerHTML = html;
}