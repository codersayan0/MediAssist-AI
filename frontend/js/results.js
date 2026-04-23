/* ═══════════════════════════════════════════
   MediAssist AI — results.js (FINAL CLEAN)
═══════════════════════════════════════════ */

const container = document.getElementById("resultsContainer");

// Load data safely
const data = Utils.loadResult();

if (!data || Object.keys(data).length === 0) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>No Results Found</h3>
      <p>Please perform analysis first.</p>
    </div>
  `;
  console.error("No result data found");
} else {

  console.log("RESULT DATA:", data);

  const ml  = data.ml_prediction || {};
  const rec = data.recommendations || {};

  const disease  = ml.disease || "Unknown";
  const severity = ml.severity_score || "N/A";
  const urgency  = (ml.urgency || "low").toLowerCase();

  const description = rec.description || "";
  const medications = Utils.cleanArray(rec.medications || rec.medication || []);
  const diet        = Utils.cleanArray(rec.diet || []);
  const precautions = Utils.cleanArray(rec.precautions || []);

  // 🎨 Urgency color
  function getColor(level) {
    if (level === "high") return "#A32D2D";
    if (level === "medium") return "#BA7517";
    return "#3B6D11";
  }

  // 📦 Card component
  function card(title, content, highlight = false) {
    return `
      <div class="result-card ${highlight ? "result-highlight" : ""}">
        <h3 style="margin-bottom:10px;">${title}</h3>
        ${content}
      </div>
    `;
  }

  let html = "";

  // 🦠 Disease Prediction
  html += card("🦠 Disease Prediction", `
    <p style="font-size:18px;font-weight:600;">${disease}</p>
    
    <div style="margin:8px 0;">
      ${Utils.urgencyBadge(urgency)}
    </div>

    <p>
      Severity Score: 
      <strong style="color:${getColor(urgency)}">${severity}</strong>
    </p>
  `, true);

// 📊 Circular Confidence Chart
if (ml.top3_predictions && ml.top3_predictions.length > 0) {

  const p = ml.top3_predictions[0]; // main disease
  const value = p.confidence;

  let color = "#e74c3c"; // red
  if (value > 70) color = "#2ecc71"; // green
  else if (value > 40) color = "#f39c12"; // orange

  html += `
    <div class="result-card">
      <h3>📊 Confidence Score</h3>

      <div style="display:flex;justify-content:center;align-items:center;">
        <div class="circle" style="--value:${value}; --color:${color};">
          <span>${value}%</span>
        </div>
      </div>

      <p style="text-align:center;margin-top:10px;">
        ${p.disease}
      </p>
    </div>
  `;
}
  // 📖 Description
  if (description) {
    html += card("📖 Description", `<p>${description}</p>`);
  }

  // 💊 Medicines
  if (medications.length > 0) {
    html += card("💊 Medicines", Utils.buildList(medications));
  }

  // 🥗 Diet
  if (diet.length > 0) {
    html += card("🥗 Diet Plan", Utils.buildList(diet));
  }

  // ⚠️ Precautions
  if (precautions.length > 0) {
    html += card("⚠️ Precautions", Utils.buildList(precautions));
  }

  // 📌 No recommendation fallback
  if (!medications.length && !diet.length && !precautions.length) {
    html += card("ℹ️ Info", `
      <p>No additional recommendations available.</p>
    `);
  }

  // ⚠️ Disclaimer
  html += `
    <div style="
      margin-top:20px;
      padding:15px;
      background:#f5f5f5;
      font-size:12px;
      border-radius:8px;
      text-align:center;
      color:#555;
    ">
      <strong>Disclaimer:</strong> This is AI-based guidance. 
      Always consult a licensed medical professional.
    </div>
  `;

  // Render
  container.innerHTML = html;
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;

  const data = Utils.loadResult();
  if (!data) {
    alert("No data found");
    return;
  }

  const ml = data.ml_prediction || {};
  const rec = data.recommendations || {};

  const doc = new jsPDF();

  let y = 10;

  // Title
  doc.setFontSize(18);
  doc.text("MediAssist AI Report", 10, y);
  y += 10;

  doc.setFontSize(12);

  // Disease
  doc.text(`Disease: ${ml.disease}`, 10, y); y += 8;
  doc.text(`Severity: ${ml.severity_score}`, 10, y); y += 8;
  doc.text(`Urgency: ${ml.urgency}`, 10, y); y += 10;

  // Description
  if (rec.description) {
    doc.text("Description:", 10, y); y += 6;
    doc.text(doc.splitTextToSize(rec.description, 180), 10, y);
    y += 15;
  }

  // Helper function for list
  function addList(title, list) {
    if (list && list.length > 0) {
      doc.text(title + ":", 10, y);
      y += 6;

      list.forEach(item => {
        doc.text(`- ${item}`, 12, y);
        y += 6;
      });

      y += 4;
    }
  }

  addList("Medicines", rec.medications || rec.medication);
  addList("Diet Plan", rec.diet);
  addList("Precautions", rec.precautions);

  // Footer
  doc.setFontSize(10);
  doc.text(
    "Disclaimer: This is AI-based guidance. Consult a doctor.",
    10,
    280
  );

  doc.save("MediAssist_Report.pdf");
}

function findHospitals() {

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Open Google Maps with hospital search
      const url = `https://www.google.com/maps/search/hospitals+near+me/@${lat},${lng},15z`;

      window.open(url, "_blank");
    },
    error => {
      alert("Location access denied. Please allow location.");
    }
  );
}