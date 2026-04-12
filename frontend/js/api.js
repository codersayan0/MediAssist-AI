const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

const API_BASE = "http://localhost:5000/api";


function fetchWithTimeout(url, options, ms = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function analyzeSymptoms(payload) {
  const res = await fetchWithTimeout(`${API_BASE}/analyze-symptoms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }
  return res.json();
}

async function analyzeReport(formData) {
  const res = await fetchWithTimeout(`${API_BASE}/analyze-report`, {
    method: "POST",
    body: formData
  }, 60000);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }
  return res.json();
}

// ── Manual CBC Entry ──────────────────────
async function analyzeManual(payload) {
  const res = await fetchWithTimeout(`${API_BASE}/analyze-cbc-manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }
  return res.json();
}

window.MediAssistAPI = { analyzeSymptoms, analyzeReport, analyzeManual };