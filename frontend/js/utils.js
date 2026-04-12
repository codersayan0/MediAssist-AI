/* ═══════════════════════════════════════════
   MediAssist AI — utils.js
   Shared helper functions used across all pages
═══════════════════════════════════════════ */

const Utils = {

  /* ── FORMAT FILE SIZE ───────────────────── */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  },

  /* ── URGENCY BADGE HTML ─────────────────── */
  urgencyBadge(level) {
    const map = {
      high:   { cls: "badge-high",   label: "High Urgency" },
      medium: { cls: "badge-medium", label: "Moderate" },
      low:    { cls: "badge-low",    label: "Low Urgency" }
    };
    const item = map[(level || "low").toLowerCase()] || map.low;
    return `<span class="badge ${item.cls}">${item.label}</span>`;
  },

  /* ── CONFIDENCE BADGE ───────────────────── */
  confidenceBadge(level) {
    const map = {
      high:   "badge-success",
      medium: "badge-medium",
      low:    "badge-neutral"
    };
    const cls = map[(level || "low").toLowerCase()] || "badge-neutral";
    return `<span class="badge ${cls}">${level || "Unknown"}</span>`;
  },

  /* ── CAPITALIZE FIRST LETTER ────────────── */
  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /* ── CLEAN ARRAY — remove nulls/blanks ──── */
  cleanArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => item && String(item).trim() !== "" && item !== "nan" && item !== "NaN");
  },

  /* ── BUILD RESULT LIST HTML ─────────────── */
  buildList(items, dotColor = "") {
    const cleaned = Utils.cleanArray(items);
    if (cleaned.length === 0) return "<p style='font-size:13px;color:#B4B2A9'>No data available.</p>";
    return `<ul class="result-list">
      ${cleaned.map(item =>
        `<li><span class="list-dot ${dotColor}"></span>${item}</li>`
      ).join("")}
    </ul>`;
  },

  /* ── SHOW TOAST NOTIFICATION ────────────── */
  showToast(message, type = "info") {
    const existing = document.getElementById("ma-toast");
    if (existing) existing.remove();

    const colors = {
      info:    { bg: "#E6F1FB", border: "#85B7EB", color: "#0C447C" },
      success: { bg: "#E1F5EE", border: "#5DCAA5", color: "#085041" },
      error:   { bg: "#FCEBEB", border: "#F09595", color: "#791F1F" },
      warning: { bg: "#FAEEDA", border: "#FAC775", color: "#633806" }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement("div");
    toast.id = "ma-toast";
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: ${c.bg}; border: 0.5px solid ${c.border}; color: ${c.color};
      padding: 12px 20px; border-radius: 10px; font-size: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      animation: slideUp 0.3s ease; max-width: 320px; line-height: 1.5;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /* ── LOADING STATE TOGGLE ───────────────── */
  setLoading(show, containerId = "loading", btnId = null) {
    const el = document.getElementById(containerId);
    if (el) el.classList.toggle("active", show);

    if (btnId) {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.disabled = show;
        btn.style.opacity = show ? "0.6" : "1";
        btn.style.cursor  = show ? "not-allowed" : "pointer";
      }
    }
  },

  /* ── VALIDATE PATIENT FORM ──────────────── */
  validatePatient(age, symptoms = []) {
    if (!age || isNaN(age) || age < 1 || age > 120) {
      Utils.showToast("Please enter a valid age (1–120).", "warning");
      return false;
    }
    if (symptoms.length === 0) {
      Utils.showToast("Please select at least one symptom.", "warning");
      return false;
    }
    return true;
  },

  /* ── SAVE RESULT TO SESSION STORAGE ─────── */
  saveResult(data, type) {
    try {
      sessionStorage.setItem("mediassist_result", JSON.stringify(data));
      sessionStorage.setItem("mediassist_type",   type);
    } catch (e) {
      console.warn("Session storage unavailable:", e);
    }
  },

  /* ── LOAD RESULT FROM SESSION STORAGE ────── */
  loadResult() {
    try {
      const raw = sessionStorage.getItem("mediassist_result");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /* ── GET RESULT TYPE ────────────────────── */
  loadResultType() {
    return sessionStorage.getItem("mediassist_type") || "symptoms";
  },

  /* ── ANIMATE CONFIDENCE BARS ────────────── */
  animateConfidenceBars() {
    document.querySelectorAll(".confidence-bar-fill").forEach(bar => {
      const target = bar.getAttribute("data-width") || "0";
      bar.style.width = "0";
      setTimeout(() => { bar.style.width = target + "%"; }, 100);
    });
  },

  /* ── PRINT / SAVE RESULTS ───────────────── */
  printResults() {
    window.print();
  },

  /* ── FORMAT DATE ────────────────────────── */
  formatDate() {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  },

  /* ── DETECT FILE TYPE ───────────────────── */
  getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📄";
    if (["jpg","jpeg","png","webp"].includes(ext)) return "🖼";
    return "📎";
  },

  /* ── TRUNCATE LONG TEXT ─────────────────── */
  truncate(str, maxLen = 60) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
  }
};

// Add slide-up keyframe for toasts
const style = document.createElement("style");
style.textContent = `@keyframes slideUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }`;
document.head.appendChild(style);

window.Utils = Utils;