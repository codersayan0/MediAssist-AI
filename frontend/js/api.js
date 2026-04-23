const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

const API_BASE = isLocal
  ? "http://127.0.0.1:5000/api"
  : "https://your-deployed-backend.com/api";

function fetchWithTimeout(url, options = {}, ms = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// 🔹 Symptoms API
async function getSymptoms() {
  const res = await fetchWithTimeout(`${API_BASE}/symptoms`);
  if (!res.ok) throw new Error("Failed to fetch symptoms");
  return res.json();
}

// 🔹 Analyze symptoms
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

// 🔹 Manual CBC
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

window.MediAssistAPI = {
  getSymptoms,
  analyzeSymptoms,
  analyzeManual
};