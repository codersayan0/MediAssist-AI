/* ═══════════════════════════════════════════
   MediAssist AI — report_upload.js (LIGHTWEIGHT)
═══════════════════════════════════════════ */

// 🚀 TAB SWITCH
function switchTab(tab, btn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  document.getElementById("tab-" + tab).classList.add("active");
  btn.classList.add("active");
}

// 🧪 MANUAL CBC SUBMIT
async function submitManualCBC() {

  // Get values
  const wbc         = document.getElementById("wbc")?.value;
  const rbc         = document.getElementById("rbc")?.value;
  const hemoglobin  = document.getElementById("hemoglobin")?.value;
  const hematocrit  = document.getElementById("hematocrit")?.value;
  const platelets   = document.getElementById("platelets")?.value;
  const neutrophils = document.getElementById("neutrophils")?.value;
  const lymphocytes = document.getElementById("lymphocytes")?.value;
  const glucose     = document.getElementById("glucose")?.value;

  // Validate at least one input
  if (!wbc && !rbc && !hemoglobin && !glucose) {
    alert("Please enter at least one value.");
    return;
  }

  const payload = {
    wbc: parseFloat(wbc) || 0,
    rbc: parseFloat(rbc) || 0,
    hemoglobin: parseFloat(hemoglobin) || 0,
    hematocrit: parseFloat(hematocrit) || 0,
    platelets: parseFloat(platelets) || 0,
    neutrophils: parseFloat(neutrophils) || 0,
    lymphocytes: parseFloat(lymphocytes) || 0,
    glucose: parseFloat(glucose) || 0
  };

  document.getElementById("loading")?.classList.add("active");

  try {
    const result = await MediAssistAPI.analyzeManual(payload);

    // Save result
    sessionStorage.setItem("mediassist_result", JSON.stringify(result));
    sessionStorage.setItem("mediassist_type", "report");

    // Redirect
    window.location.href = "results.html";

  } catch (err) {
    alert("Analysis failed: " + err.message);
  } finally {
    document.getElementById("loading")?.classList.remove("active");
  }
}

// 🌍 GLOBAL EXPORT
window.submitManualCBC = submitManualCBC;
window.switchTab = switchTab;