
// Utility: format number as USD
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Draw a more realistic, clean & luxurious shower layout

function drawShowerLayout() {
  const canvas = document.getElementById("showerCanvas");
  if (!canvas) return;

  // Make the canvas match its display size (fixes blurriness)
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || canvas.width || 420;
  const cssHeight = rect.height || canvas.height || 280;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = cssWidth;
  const height = cssHeight;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background: wall tiles + soft vignette
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#0b0f18");
  bgGradient.addColorStop(1, "#05070b");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid to suggest tile lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  const tileSize = 26;
  for (let y = 0; y < height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = width * 0.05; x < width * 0.95; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Read config values
  const panelCount = Number(document.getElementById("panelCount").value) || 0;
  const glassHeight = Number(document.getElementById("glassHeight").value) || 78;
  const totalWidth = Number(document.getElementById("totalWidth").value) || 60;
  const layoutType = document.querySelector('input[name="layoutType"]:checked')?.value || "inline";
  const hardwareColor = document.getElementById("hardwareColor").value;
  const doorType = document.getElementById("doorType").value;

  // Height scaling
  const maxDrawHeight = height * 0.6;
  const pxPerInch = maxDrawHeight / Math.max(glassHeight, 60);

  // Width scaling (slightly different per layout for better composition)
  let usableWidth;
  if (layoutType === "inline") usableWidth = width * 0.75;
  else if (layoutType === "corner") usableWidth = width * 0.52;
  else usableWidth = width * 0.64; // u-shape / 3-sided

  const pxPerInchWidth = usableWidth / Math.max(totalWidth || 1, 40);

  // Read per-panel widths
  const panels = [];
  for (let i = 1; i <= panelCount; i++) {
    const input = document.getElementById(`panelWidth-${i}`);
    const raw = input ? Number(input.value) || 0 : 0;
    panels.push(raw);
  }

  const sumPanels = panels.reduce((a, b) => a + b, 0) || totalWidth || 1;
  const normalization = totalWidth && sumPanels > 0 ? totalWidth / sumPanels : 1;

  // Map hardware color to metal tone
  
  // Map hardware color to a strong, visible metal tone
  let metalTone = "#dee8ff"; // polished chrome (cool silver)
  if (hardwareColor === "black") metalTone = "#f0f0f0"; // bright neutral so it pops on dark bg
  if (hardwareColor === "brushed-nickel") metalTone = "#c7cbd4"; // softer warm gray
  if (hardwareColor === "gold") metalTone = "#ffd56a"; // warm gold

  const baseX = width * 0.13;
  const floorY = height * 0.78;

  // Draw shower base (threshold)
  const baseGrad = ctx.createLinearGradient(0, floorY, 0, floorY + 16);
  baseGrad.addColorStop(0, "#282f3d");
  baseGrad.addColorStop(1, "#171c25");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(width * 0.08, floorY, width * 0.84, 16);

  // Soft reflection below glass
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.beginPath();
  ctx.ellipse(width * 0.5, floorY + 12, width * 0.32, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Door index (simplified: middle panel)
  const safePanelCount = Math.max(panelCount, 1);
  const doorIndex = Math.min(Math.max(2, Math.ceil(safePanelCount / 2)), safePanelCount);

  // Helper to draw one glass panel
  function drawPanel(x, w, h, isDoor) {
    const y = floorY - h;

    // Glass gradient fill
    const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    glassGrad.addColorStop(0, "rgba(195, 214, 255, 0.12)");
    glassGrad.addColorStop(0.5, "rgba(105, 140, 200, 0.06)");
    glassGrad.addColorStop(1, "rgba(110, 142, 196, 0.12)");
    ctx.fillStyle = glassGrad;
    ctx.fillRect(x, y, w, h);

    // Glass highlight band
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + w * 0.15, y + 4, w * 0.07, h - 12);

    // Panel border
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = isDoor ? metalTone : "rgba(255,255,255,0.55)";
    ctx.strokeRect(x, y, w, h);

    // Top rail for sliding door
    if (isDoor && doorType === "sliding") {
      ctx.lineWidth = 3;
      ctx.strokeStyle = metalTone;
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x + w, y + 10);
      ctx.stroke();

      // Small rollers
      ctx.lineWidth = 1.5;
      const rollerY = y + 10;
      ctx.beginPath();
      ctx.arc(x + w * 0.2, rollerY + 1, 3, 0, Math.PI * 2);
      ctx.arc(x + w * 0.8, rollerY + 1, 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Hinges + handle for swing door
    if (isDoor && doorType === "swing") {
      // Hinges
      ctx.fillStyle = metalTone;
      const hingeWidth = 7;
      const hingeHeight = 16;
      const hingeX = x;
      const upperHingeY = y + h * 0.18;
      const lowerHingeY = y + h * 0.6;
      ctx.fillRect(hingeX - 2, upperHingeY, hingeWidth, hingeHeight);
      ctx.fillRect(hingeX - 2, lowerHingeY, hingeWidth, hingeHeight);

      // Handle
      ctx.lineWidth = 3;
      ctx.strokeStyle = metalTone;
      const handleX = x + w - 14;
      const handleY = y + h * 0.45;
      ctx.beginPath();
      ctx.moveTo(handleX, handleY - 12);
      ctx.lineTo(handleX, handleY + 12);
      ctx.stroke();

      // Swing arc
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(255, 213, 106, 0.9)";
      const arcRadius = w * 1.05;
      ctx.beginPath();
      ctx.arc(x, handleY + 2, arcRadius, -0.2, 0.7, false);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // INLINE LAYOUT
  if (layoutType === "inline") {
    let currentX = baseX;
    panels.forEach((panelWidth, idx) => {
      const normalizedPanelWidth = panelWidth * normalization || (totalWidth / Math.max(safePanelCount, 1));
      const drawWidth = Math.max(normalizedPanelWidth * pxPerInchWidth, 28);
      const drawHeight = glassHeight * pxPerInch;

      drawPanel(currentX, drawWidth, drawHeight, idx + 1 === doorIndex);
      currentX += drawWidth;
    });

  // CORNER LAYOUT
  } else if (layoutType === "corner") {
    const frontPanels = panels.slice(0, Math.max(panelCount - 1, 1));
    const returnPanels = panels.slice(Math.max(panelCount - 1, 1));

    // Front run
    let currentX = baseX;
    frontPanels.forEach((panelWidth, idx) => {
      const normalizedPanelWidth = panelWidth * normalization || (totalWidth / Math.max(frontPanels.length, 1));
      const drawWidth = Math.max(normalizedPanelWidth * pxPerInchWidth, 28);
      const drawHeight = glassHeight * pxPerInch;

      drawPanel(currentX, drawWidth, drawHeight, idx + 1 === doorIndex);
      currentX += drawWidth;
    });

    // Corner return
    if (returnPanels.length > 0) {
      const returnWidthInches = returnPanels.reduce((a, b) => a + b, 0) * normalization;
      const returnWidth = returnWidthInches * pxPerInchWidth;
      const drawHeight = glassHeight * pxPerInch;
      const x = currentX - 6;

      // Slight perspective: make return narrower visually
      const perspectiveWidth = returnWidth * 0.7;
      const y = floorY - drawHeight;

      // Glass polygon
      const glassGrad = ctx.createLinearGradient(x, y, x + perspectiveWidth, y + drawHeight);
      glassGrad.addColorStop(0, "rgba(195, 214, 255, 0.10)");
      glassGrad.addColorStop(1, "rgba(110, 142, 196, 0.16)");
      ctx.fillStyle = glassGrad;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + perspectiveWidth, y + 16);
      ctx.lineTo(x + perspectiveWidth, floorY);
      ctx.lineTo(x, floorY);
      ctx.closePath();
      ctx.fill();

      // Edges
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(230,240,255,0.75)";
      ctx.stroke();
    }

  // U-SHAPED LAYOUT (3-sided with curve symbol)
  
  } else {
    // U-shaped layout: front is flat like inline, with small "tabs" on left/right to hint the curve
    const frontPanels = [];
    for (let i = 0; i < 3; i++) {
      frontPanels.push(panels[i] || (totalWidth / 3));
    }
    const frontSum = frontPanels.reduce((a, b) => a + b, 0) || totalWidth || 1;
    const frontPxPerIn = usableWidth / frontSum;

    const drawHeight = glassHeight * pxPerInch;
    const frontWidths = frontPanels.map((wIn) => Math.max(wIn * frontPxPerIn, 28));

    const leftW = frontWidths[0];
    const doorW = frontWidths[1];
    const rightW = frontWidths[2];

    const totalFront = leftW + doorW + rightW;
    const startX = (width - totalFront) / 2;

    const leftX = startX;
    const doorX = startX + leftW;
    const rightX = doorX + doorW;

    // Draw front, completely flat like inline
    drawPanel(leftX, leftW, drawHeight, false);
    drawPanel(doorX, doorW, drawHeight, true);
    drawPanel(rightX, rightW, drawHeight, false);

    // Small side "tabs" to suggest the return panels (symbolic only)
    const tabDepth = Math.max(width * 0.04, 16);
    const y = floorY - drawHeight;

    // Left tab
    let px = leftX + 2;
    ctx.fillStyle = "rgba(195, 214, 255, 0.10)";
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px - tabDepth, y + 10);
    ctx.lineTo(px - tabDepth, y + 26);
    ctx.lineTo(px, y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "rgba(230,240,255,0.75)";
    ctx.stroke();

    // Right tab
    px = rightX + rightW - 2;
    ctx.fillStyle = "rgba(195, 214, 255, 0.10)";
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px + tabDepth, y + 10);
    ctx.lineTo(px + tabDepth, y + 26);
    ctx.lineTo(px, y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "rgba(230,240,255,0.75)";
    ctx.stroke();

    // Curved top indicator to show it's still U-shaped
    ctx.strokeStyle = "rgba(255, 213, 106, 0.9)";
    ctx.setLineDash([10, 7]);
    ctx.lineWidth = 2;
    const arcY = y - 14;
    const arcRadius = (rightX + rightW - leftX) * 0.7;
    ctx.beginPath();
    ctx.arc(width * 0.5, arcY, arcRadius / 2, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();
    ctx.setLineDash([]);
  }

// Recommended height line (78")
  const recHeightIn = 78;
  const recY = floorY - recHeightIn * pxPerInch;
  ctx.strokeStyle = "rgba(255,213,106,0.7)";
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(width * 0.05, recY);
  ctx.lineTo(width * 0.95, recY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(width * 0.05, recY - 16, 120, 16);
  ctx.fillStyle = "#ffd56a";
  ctx.font = "10px Poppins, system-ui";
  ctx.fillText("Recommended height", width * 0.06, recY - 4);
}


// PRICE ESTIMATE LOGIC
// NOTE: If you want to adjust your pricing, this is the ONLY function you need to edit.
function updatePrice() {
  const glassThickness = Number(document.getElementById("glassThickness").value) || 0.375;
  const doorType = document.getElementById("doorType").value;
  const panelCount = Number(document.getElementById("panelCount").value) || 0;
  const glassHeight = Number(document.getElementById("glassHeight").value) || 78;

  const panels = [];
  for (let i = 1; i <= panelCount; i++) {
    const input = document.getElementById(`panelWidth-${i}`);
    const raw = input ? Number(input.value) || 0 : 0;
    panels.push(raw);
  }
  
  
  

  const totalWidth = panels.reduce((a, b) => a + b, 0);
  // Area in square feet (simplified)
  const areaSqft = (totalWidth * glassHeight) / 144;

  // ----- PRICING VARIABLES YOU CAN CHANGE -----
  // Base glass rate depending on thickness (per sq ft)
  let baseRate = glassThickness >= 0.5 ? 140 : 140;

  // Door premium
  const doorPremium = doorType === "sliding" ? 600 : 350;

  // Extra panels premium (beyond 2 panels)
  const extraPanelsPremium = Math.max(panelCount - 2, 0) * 120;

  // Installer buffer / profit markup (e.g., 1.22 = +22%)
  const markupMultiplier = 1.22;

  // Minimum project amount (so small showers still hit your target)
  const minimumProjectTotal = 5000;
  // -------------------------------------------

  const glassCost = areaSqft * baseRate;
  const hardwareCost = doorPremium + extraPanelsPremium;

  let total = glassCost + hardwareCost;
  total *= markupMultiplier;
  total = Math.max(total, minimumProjectTotal);

  document.getElementById("glassAreaSqft").textContent = areaSqft.toFixed(1);
  document.getElementById("glassRateLabel").textContent = `${formatCurrency(baseRate)} / sq ft`;
  document.getElementById("hardwareCostLabel").textContent = formatCurrency(hardwareCost);
  document.getElementById("priceAmount").textContent = formatCurrency(total);
}

// Generate per-panel inputs
function generatePanelInputs() {
  const panelCount = Number(document.getElementById("panelCount").value) || 0;
  const container = document.getElementById("panelInputs");
  container.innerHTML = "";

  for (let i = 1; i <= panelCount; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "panel-input";

    const label = document.createElement("label");
    label.innerHTML = `Panel ${i} Width (in)`;

    const input = document.createElement("input");
    input.type = "number";
    input.id = `panelWidth-${i}`;
    input.min = "8";
    input.max = "60";
    input.placeholder = "e.g. 24";
    input.addEventListener("input", () => {
      updatePrice();
      drawShowerLayout();
    });

    label.appendChild(input);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  }
}

// Auth modal & tabs
function setupAuthModal() {
  const openBtn = document.getElementById("openAuthBtn");
  const closeBtn = document.getElementById("closeAuthBtn");
  const modal = document.getElementById("authModal");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // Tabs
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Stub handlers for login/register
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Login integration placeholder. Connect this form to your auth backend (e.g. Firebase, Supabase, or custom API).");
  });

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Registration integration placeholder. Connect this form to your backend to create users and send confirmation emails.");
  });
}

// Save design (placeholder)
function setupSaveDesign() {
  const btn = document.getElementById("saveDesignBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    alert("To fully implement saving projects, connect this button to your backend.\n\nRecommended: send all selected options, panel sizes, and an auto-generated estimate to your API, then redirect the user to login/register if needed.");
    // Here you would gather all data and POST to /api/projects or similar.
  });
}

// Load Google reviews from backend (optional)
async function loadGoogleReviews() {
  const listEl = document.getElementById("reviewsList");
  if (!listEl) return;

  // TODO: Replace this URL with your real backend endpoint.
  const endpoint = "/api/google-reviews";

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return; // keep static samples
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return;

    listEl.innerHTML = "";

    data.forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card";

      const header = document.createElement("div");
      header.className = "review-header";

      const h3 = document.createElement("h3");
      h3.textContent = `${review.rating.toFixed(1)} ★★★★★`.trim();

      const spanLoc = document.createElement("span");
      spanLoc.textContent = review.location || "";

      header.appendChild(h3);
      header.appendChild(spanLoc);

      const bodyP = document.createElement("p");
      bodyP.textContent = review.text;

      const nameSpan = document.createElement("span");
      nameSpan.className = "review-name";
      nameSpan.textContent = `— ${review.author || "Customer"}`;

      card.appendChild(header);
      card.appendChild(bodyP);
      card.appendChild(nameSpan);

      listEl.appendChild(card);
    });
  } catch (err) {
    console.warn("Could not load live Google reviews. Using static fallback.", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Current year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  generatePanelInputs();
  updatePrice();
  drawShowerLayout();
  setupAuthModal();
  setupSaveDesign();
  loadGoogleReviews();

  document.getElementById("panelCount").addEventListener("input", () => {
    generatePanelInputs();
    updatePrice();
    drawShowerLayout();
  });

  [
    "glassThickness",
    "doorType",
    "glassHeight",
    "totalWidth",
    "hardwareColor",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        updatePrice();
        drawShowerLayout();
      });
    }
  });

  const layoutRadios = document.querySelectorAll('input[name="layoutType"]');
  layoutRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      drawShowerLayout();
    });
  });
});



// SIMPLE HERO CAROUSEL
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".hero-carousel");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  const prevBtn = carousel.querySelector(".hero-prev");
  const nextBtn = carousel.querySelector(".hero-next");

  let current = 0;
  let autoTimer = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  function next() {
    showSlide(current + 1);
  }

  function prev() {
    showSlide(current - 1);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 6000); // 6 seconds
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // Arrow events
  if (prevBtn) prevBtn.addEventListener("click", () => {
    prev();
    startAuto();
  });

  if (nextBtn) nextBtn.addEventListener("click", () => {
    next();
    startAuto();
  });

  // Dot events
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index || 0);
      showSlide(idx);
      startAuto();
    });
  });

  // Init
  showSlide(0);
  startAuto();

  // Optional: pause on hover
  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);
});

// JS for popup page form to fill CS manual project

// Popup form open/close + EmailJS submit
function setupPopupForm() {
  const modal = document.getElementById("popupForm");
  const openBtn = document.getElementById("openForm");
  const closeBtn = document.getElementById("closeForm");
  const form = document.getElementById("customerForm");

  if (!modal || !openBtn || !closeBtn || !form) return;

  // Open / close
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
  });
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // Submit via EmailJS
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Optional: basic UX lock
    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    try {
      // Make sure you've created a service and template in EmailJS
      // and your template fields match: name, email, phone, message
      await emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", form);

      alert("Thanks! Your project was sent successfully.");
      form.reset();
      modal.classList.remove("active");
    } catch (err) {
      console.error(err);
      alert("Sorry—there was a problem sending your message. Please try again.");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
    }
  });
}

// new  

document.addEventListener("DOMContentLoaded", () => {
  // ... your existing init code ...
  generatePanelInputs();
  updatePrice();
  drawShowerLayout();
  setupAuthModal();
  setupSaveDesign();
  loadGoogleReviews();

  // NEW:
  setupPopupForm();

  document.getElementById("panelCount").addEventListener("input", () => {
    generatePanelInputs();
    updatePrice();
    drawShowerLayout();
  });

  ["glassThickness", "doorType", "glassHeight", "totalWidth", "hardwareColor"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => { updatePrice(); drawShowerLayout(); });
  });

  const layoutRadios = document.querySelectorAll('input[name="layoutType"]');
  layoutRadios.forEach((radio) => radio.addEventListener("change", drawShowerLayout));
});
