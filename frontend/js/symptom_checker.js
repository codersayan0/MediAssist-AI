let selected = new Set();
let ALL_SYMPTOMS = [];

// 🔄 Load symptoms from backend
async function loadSymptoms() {
  try {
    ALL_SYMPTOMS = await MediAssistAPI.getSymptoms();
    console.log("Loaded symptoms:", ALL_SYMPTOMS);

    renderTags(ALL_SYMPTOMS);

  } catch (err) {
    console.error("❌ Failed to load symptoms:", err);

    // fallback
    ALL_SYMPTOMS = [
      "fever","headache","cough","fatigue","nausea","vomiting"
    ];
    renderTags(ALL_SYMPTOMS);
  }
}

// 🎯 Render tags
function renderTags(symptoms) {
  const container = document.getElementById("symptomTags");
  container.innerHTML = "";

  symptoms.forEach(s => {
    const tag = document.createElement("span");
    tag.className = "symptom-tag";
    tag.textContent = s;

    tag.onclick = () => toggleTag(s, tag);

    container.appendChild(tag);
  });
}

// 🔁 Toggle selection
function toggleTag(symptom, el) {
  if (selected.has(symptom)) {
    selected.delete(symptom);
    el.classList.remove("selected");
  } else {
    selected.add(symptom);
    el.classList.add("selected");
  }

  updateSelectedList();
}

// 🧾 Update selected UI
function updateSelectedList() {
  const el = document.getElementById("selectedList");
  const empty = document.getElementById("emptyText");

  if (selected.size > 0) {
    el.textContent = "Selected: " + [...selected].join(", ");
    empty.style.display = "none";
  } else {
    el.textContent = "";
    empty.style.display = "block";
  }
}

// ✍️ Custom input
document.addEventListener("DOMContentLoaded", () => {

  loadSymptoms();

  document.getElementById("customSymptom").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();

      const val = e.target.value.trim().toLowerCase();

      if (!val) return;

      if (!ALL_SYMPTOMS.includes(val)) {
        alert("Symptom not found in dataset!");
        return;
      }

      selected.add(val);

      document.querySelectorAll(".symptom-tag").forEach(tag => {
        if (tag.textContent === val) {
          tag.classList.add("selected");
        }
      });

      updateSelectedList();
      e.target.value = "";
    }
  });
});

// 🚀 Submit
async function submitSymptoms() {
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;

  if (!age || selected.size === 0) {
    alert("Please enter age and select symptoms.");
    return;
  }

  const payload = {
    age: parseInt(age),
    gender,
    symptoms: [...selected]
  };

  console.log("Sending payload:", payload);

  document.getElementById("loading").classList.add("active");

  try {
    const result = await MediAssistAPI.analyzeSymptoms(payload);

    console.log("✅ API RESULT:", result);

    // Save result
    sessionStorage.setItem("mediassist_result", JSON.stringify(result));
    sessionStorage.setItem("mediassist_type", "symptoms");

    window.location.href = "results.html";

  } catch (err) {
    console.error("❌ API ERROR:", err);

    alert(
      "Server connection failed.\n\n" +
      "Make sure backend is running on http://127.0.0.1:5000"
    );
  } finally {
    document.getElementById("loading").classList.remove("active");
  }
}