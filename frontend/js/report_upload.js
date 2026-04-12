/* ═══════════════════════════════════════════
   MediAssist AI — report_upload.js
═══════════════════════════════════════════ */

let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {
  initUploadZone();
});

/* ── INIT UPLOAD ZONE ───────────────────── */
function initUploadZone() {
  const zone  = document.getElementById("uploadZone");
  const input = document.getElementById("fileInput");

  if (!zone || !input) return;

  zone.addEventListener("click", (e) => {
    if (e.target.id !== "removeFile") input.click();
  });

  input.addEventListener("change", () => {
    if (input.files[0]) handleFile(input.files[0]);
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
}

/* ── HANDLE FILE ────────────────────────── */
function handleFile(file) {
  const ALLOWED = ["application/pdf","image/jpeg","image/png","image/webp"];
  if (!ALLOWED.includes(file.type)) {
    Utils.showToast("Only PDF, JPG, PNG, WEBP allowed.", "error");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    Utils.showToast("File too large. Max 10MB.", "error");
    return;
  }

  selectedFile = file;

  const zone = document.getElementById("uploadZone");
  if (zone) zone.classList.add("has-file");

  const preview = document.getElementById("filePreview");
  if (preview) {
    preview.classList.add("visible");
    document.getElementById("previewIcon").textContent = Utils.getFileIcon(file.name);
    document.getElementById("previewName").textContent = Utils.truncate(file.name, 40);
    document.getElementById("previewSize").textContent = Utils.formatFileSize(file.size);
  }

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const thumb = document.getElementById("imageThumbnail");
      if (thumb) { thumb.src = e.target.result; thumb.style.display = "block"; }
    };
    reader.readAsDataURL(file);
  }

  updateStep(2);
  Utils.showToast("File selected: " + file.name, "success");
}

/* ── REMOVE FILE ────────────────────────── */
function removeFile() {
  selectedFile = null;
  const zone = document.getElementById("uploadZone");
  if (zone) zone.classList.remove("has-file");
  const preview = document.getElementById("filePreview");
  if (preview) preview.classList.remove("visible");
  const thumb = document.getElementById("imageThumbnail");
  if (thumb) { thumb.src = ""; thumb.style.display = "none"; }
  const input = document.getElementById("fileInput");
  if (input) input.value = "";
  updateStep(1);
  Utils.showToast("File removed.", "info");
}

/* ── STEP INDICATOR ─────────────────────── */
function updateStep(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById(`step${i}`);
    const label  = document.getElementById(`stepLabel${i}`);
    if (!circle) continue;
    circle.className = "step-circle";
    if (label) label.className = "step-label";
    if (i < step) {
      circle.classList.add("done");
      circle.textContent = "✓";
      if (label) label.classList.add("done");
    } else if (i === step) {
      circle.classList.add("active");
      if (label) label.classList.add("active");
    }
  }
}

/* ── SUBMIT REPORT ──────────────────────── */
async function submitReport() {
  const age    = document.getElementById("age")?.value;
  const gender = document.getElementById("gender")?.value;

  if (!age || isNaN(age) || age < 1 || age > 120) {
    Utils.showToast("Please enter a valid age (1–120).", "warning");
    return;
  }
  if (!selectedFile) {
    Utils.showToast("Please upload a report first.", "warning");
    return;
  }

  updateStep(3);
  Utils.setLoading(true, "loading", "submitBtn");

  const formData = new FormData();
  formData.append("file",           selectedFile);
  formData.append("patient_age",    age);
  formData.append("patient_gender", gender);

  try {
    const result = await MediAssistAPI.analyzeReport(formData);

    // ✅ Save with type "report" then redirect
    sessionStorage.setItem("mediassist_result", JSON.stringify(result));
    sessionStorage.setItem("mediassist_type",   "report");

    Utils.showToast("Analysis complete! Redirecting…", "success");
    setTimeout(() => { window.location.href = "results.html"; }, 800);

  } catch (err) {
    Utils.showToast("Analysis failed: " + err.message, "error");
    updateStep(2);
  } finally {
    Utils.setLoading(false, "loading", "submitBtn");
  }
}

/* ── MANUAL CBC SUBMIT ──────────────────── */
async function submitManualCBC() {
  const age    = document.getElementById("ageManual")?.value;
  const gender = document.getElementById("genderManual")?.value;

  const fields = ["wbc","rbc","hemoglobin","hematocrit","platelets","neutrophils","lymphocytes"];
  const values = {};
  let hasOne   = false;

  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && el.value.trim() !== "") {
      values[f] = parseFloat(el.value);
      hasOne = true;
    }
  });

  if (!age || !hasOne) {
    Utils.showToast("Please enter age and at least one CBC value.", "warning");
    return;
  }

  Utils.setLoading(true, "loading", "manualSubmitBtn");

  try {
    const result = await MediAssistAPI.analyzeManual({
      ...values  // ✅ flatten data
       });

    // ✅ Save with type "report" then redirect
    sessionStorage.setItem("mediassist_result", JSON.stringify(result));
    sessionStorage.setItem("mediassist_type",   "report");
    window.location.href = "results.html";

    Utils.showToast("Analysis complete! Redirecting…", "success");
    setTimeout(() => { window.location.href = "results.html"; }, 800);

  } catch (err) {
    Utils.showToast("Error: " + err.message, "error");
  } finally {
    Utils.setLoading(false, "loading", "manualSubmitBtn");
  }
}

window.removeFile      = removeFile;
window.submitReport    = submitReport;
window.submitManualCBC = submitManualCBC;
window.handleFile      = handleFile;