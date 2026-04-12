const SYMPTOMS = [
  "fever","headache","cough","fatigue","nausea","vomiting",
  "chest pain","shortness of breath","abdominal pain","diarrhea",
  "sore throat","body ache","dizziness","rash","swollen lymph nodes",
  "loss of appetite","joint pain","back pain","itching","chills",
  "runny nose","sneezing","eye pain","weight loss","night sweats"
];

let selected = new Set();

function initTags() {
  const container = document.getElementById("symptomTags");
  SYMPTOMS.forEach(s => {
    const tag = document.createElement("span");
    tag.className = "symptom-tag";
    tag.textContent = s;
    tag.onclick = () => toggleTag(s, tag);
    container.appendChild(tag);
  });
}

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

function updateSelectedList() {
  const el = document.getElementById("selectedList");
  el.textContent = selected.size > 0
    ? "Selected: " + [...selected].join(", ")
    : "";
}

// Add custom symptom on Enter
document.addEventListener("DOMContentLoaded", () => {
  initTags();
  document.getElementById("customSymptom").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.target.value.trim().toLowerCase();
      if (val) {
        selected.add(val);
        updateSelectedList();
        e.target.value = "";
      }
    }
  });
});

async function submitSymptoms() {
  const age    = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;

  if (!age || selected.size === 0) {
    alert("Please enter your age and select at least one symptom.");
    return;
  }

  const payload = { age: parseInt(age), gender, symptoms: [...selected] };

  document.getElementById("loading").classList.add("active");

  try {
    const result = await MediAssistAPI.analyzeSymptoms(payload);
    // Save result and redirect to results page
    sessionStorage.setItem("mediassist_result", JSON.stringify(result));
    sessionStorage.setItem("mediassist_type", "symptoms");
    window.location.href = "results.html";
  } catch (err) {
    alert("Analysis failed: " + err.message);
  } finally {
    document.getElementById("loading").classList.remove("active");
  }
}