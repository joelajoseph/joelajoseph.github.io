// --- HOME PAGE LOGIC ---
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section");

function showSection(id) {
  sections.forEach(section => {
    section.style.display = section.id === id ? "block" : "none";
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("data-target");
    showSection(targetId);
  });
});

const navHome = document.getElementById("nav-home");
if (navHome) {
  navHome.addEventListener("click", function(e) {
    e.preventDefault();
    showSection("home");
  });
}

showSection("home");

// --- KINEMATICS CALCULATOR LOGIC ---
const inputContainer = document.getElementById("kinematics-inputs");
const resultContainer = document.getElementById("result");

function updateKinematicsInputs() {
  const solveFor = document.getElementById("solve-for").value;
  const variables = ["v1", "v2", "a", "t", "d"];
  inputContainer.innerHTML = "";

  variables.forEach(variable => {
    if (variable === solveFor) return;

    const label = document.createElement("label");
    label.setAttribute("for", `${variable}-input`);
    label.textContent = `${variable === "v1" ? "Initial velocity (v₁)" :
                        variable === "v2" ? "Final velocity (v₂)" :
                        variable === "a" ? "Acceleration (a)" :
                        variable === "t" ? "Time (t)" : "Displacement (d)"}`;

    const input = document.createElement("input");
    input.type = "number";
    input.id = `${variable}`;
    input.name = variable;

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
  });

  resultContainer.innerHTML = "";
}

function solveKinematics() {
  const solveFor = document.getElementById("solve-for").value;
  const values = {};
  ["v1", "v2", "a", "t", "d"].forEach(v => {
    const input = document.getElementById(v);
    values[v] = input ? parseFloat(input.value) : undefined;
  });

  const { v1, v2, a, t, d } = values;
  function isValid(n) { return !isNaN(n); }
  let result;

  try {
    switch (solveFor) {
      case "v1":
        if (isValid(v2) && isValid(a) && isValid(t)) result = v2 - a * t;
        else if (isValid(v2) && isValid(a) && isValid(d)) {
          const val = v2 ** 2 - 2 * a * d;
          if (val < 0) throw "Invalid sqrt";
          result = Math.sqrt(val);
        } else throw "Missing values for v₁";
        break;
      case "v2":
        if (isValid(v1) && isValid(a) && isValid(t)) result = v1 + a * t;
        else if (isValid(v1) && isValid(a) && isValid(d)) {
          const val = v1 ** 2 + 2 * a * d;
          if (val < 0) throw "Invalid sqrt";
          result = Math.sqrt(val);
        } else throw "Missing values for v₂";
        break;
      case "a":
        if (isValid(v2) && isValid(v1) && isValid(t) && t !== 0) result = (v2 - v1) / t;
        else if (isValid(v1) && isValid(d) && isValid(t) && t !== 0) result = 2 * (d - v1 * t) / (t * t);
        else if (isValid(v2) && isValid(v1) && isValid(d) && d !== 0) result = (v2 ** 2 - v1 ** 2) / (2 * d);
        else throw "Missing values for a";
        break;
      case "t":
        if (isValid(v2) && isValid(v1) && isValid(a) && a !== 0) result = (v2 - v1) / a;
        else if (isValid(d) && isValid(v1) && isValid(a)) {
          const A = 0.5 * a, B = v1, C = -d;
          const disc = B * B - 4 * A * C;
          if (disc < 0) throw "No real solution for t";
          const t1 = (-B + Math.sqrt(disc)) / (2 * A);
          const t2 = (-B - Math.sqrt(disc)) / (2 * A);
          result = t1 >= 0 ? t1 : (t2 >= 0 ? t2 : null);
          if (result === null) throw "Negative time";
        } else throw "Missing values for t";
        break;
      case "d":
        if (isValid(v1) && isValid(t) && isValid(a)) result = v1 * t + 0.5 * a * t * t;
        else if (isValid(v1) && isValid(v2) && isValid(t)) result = ((v1 + v2) / 2) * t;
        else if (isValid(v1) && isValid(v2) && isValid(a) && a !== 0) result = (v2 ** 2 - v1 ** 2) / (2 * a);
        else throw "Missing values for d";
        break;
      default:
        throw "Invalid variable";
    }
  } catch (e) {
    resultContainer.innerText = `Error: ${e}`;
    return;
  }

  if (isNaN(result)) {
    resultContainer.innerText = "Could not compute result.";
    return;
  }

  const sigfig = parseInt(document.getElementById("sigfigs")?.value);
  const formatted = !isNaN(sigfig) && sigfig > 0 ? Number(result).toPrecision(sigfig) : result.toFixed(2);

  const units = { v1: "m/s", v2: "m/s", a: "m/s²", t: "s", d: "m" };
  resultContainer.innerText = `Result: ${formatted} ${units[solveFor] || ""}`;
}

// Event listener for kinematics-form submission
document.getElementById("kinematics-form")?.addEventListener("submit", function(event) {
  event.preventDefault();
  solveKinematics();
});

// --- PROJECTILE MOTION CALCULATOR LOGIC ---
const projectileForm = document.getElementById("projectile-form");
const projectileResultContainer = document.getElementById("projectile-result");
const projectileTypeSelect = document.getElementById("projectile-type");

function solveProjectile(event) {
  if (event) event.preventDefault();
  if (!projectileTypeSelect || !projectileResultContainer) return;
  const type = projectileTypeSelect.value;
  // Inputs: initial velocity (v0), angle (theta, degrees), initial height (h)
  const v0 = parseFloat(document.getElementById("proj-v0")?.value);
  const thetaDeg = parseFloat(document.getElementById("proj-angle")?.value);
  const h = parseFloat(document.getElementById("proj-h")?.value);
  let g = 9.8;
  if (isNaN(g)) g = 9.8;
  if ([v0, thetaDeg, h].some(x => isNaN(x))) {
    projectileResultContainer.innerText = "Error: Please provide initial velocity, angle, and height.";
    return;
  }
  const theta = thetaDeg * Math.PI / 180;
  let result, units;
  try {
    if (type === "range") {
      // Range with initial height: R = v0x * t_total, t_total = (v0y + sqrt(v0y^2 + 2gh))/g
      const v0x = v0 * Math.cos(theta);
      const v0y = v0 * Math.sin(theta);
      const discrim = v0y * v0y + 2 * g * h;
      if (discrim < 0) throw "Invalid values for range calculation.";
      const t_total = (v0y + Math.sqrt(discrim)) / g;
      result = v0x * t_total;
      units = "m";
    } else if (type === "maxheight") {
      // Max height: h_max = h + (v0y^2)/(2g)
      const v0y = v0 * Math.sin(theta);
      result = h + (v0y * v0y) / (2 * g);
      units = "m";
    } else if (type === "time") {
      // Time of flight: t_total = (v0y + sqrt(v0y^2 + 2gh))/g
      const v0y = v0 * Math.sin(theta);
      const discrim = v0y * v0y + 2 * g * h;
      if (discrim < 0) throw "Invalid values for time calculation.";
      result = (v0y + Math.sqrt(discrim)) / g;
      units = "s";
    } else {
      throw "Invalid projectile calculation type.";
    }
  } catch (e) {
    projectileResultContainer.innerText = `Error: ${e}`;
    return;
  }
  if (isNaN(result)) {
    projectileResultContainer.innerText = "Could not compute result.";
    return;
  }
  const sigfig = parseInt(document.getElementById("sigfigs-projectile")?.value);
  const formatted = !isNaN(sigfig) && sigfig > 0 ? Number(result).toPrecision(sigfig) : result.toFixed(2);
  projectileResultContainer.innerText = `Result: ${formatted} ${units}`;
  // Start projectile animation after successful calculation
  startProjectileAnimation(v0, thetaDeg, h);
}

// Event listener for projectile calculator form submission
if (projectileForm) {
  projectileForm.addEventListener("submit", solveProjectile);
}

// --- PROJECTILE MOTION ANIMATION (p5.js) ---
// Animation variables
let projAnim = {
  running: false,
  v0: 0,
  theta: 0,
  h: 0,
  g: 9.8,
  t: 0,
  t_total: 0,
  v0x: 0,
  v0y: 0,
  scale: 1,
  x0: 0,
  y0: 0,
  px: 0,
  py: 0,
  canvasW: 500,
  canvasH: 350,
};

function startProjectileAnimation(v0, thetaDeg, h) {
  // Initialize animation values
  projAnim.v0 = v0;
  projAnim.theta = thetaDeg * Math.PI / 180;
  projAnim.h = h;
  projAnim.g = 9.8;
  projAnim.v0x = v0 * Math.cos(projAnim.theta);
  projAnim.v0y = v0 * Math.sin(projAnim.theta);
  // Compute total flight time
  const discrim = projAnim.v0y * projAnim.v0y + 2 * projAnim.g * h;
  projAnim.t_total = (projAnim.v0y + Math.sqrt(discrim)) / projAnim.g;
  projAnim.t = 0;
  projAnim.running = true;
  // For scaling: find max range and max height
  const range = projAnim.v0x * projAnim.t_total;
  const h_max = h + (projAnim.v0y * projAnim.v0y) / (2 * projAnim.g);
  // Padding for display
  const pad = 40;
  projAnim.canvasW = 500;
  projAnim.canvasH = 350;
  // scale so that projectile fits in canvas
  projAnim.scale = Math.min(
    (projAnim.canvasW - pad * 2) / (range > 0 ? range : 1),
    (projAnim.canvasH - pad * 2) / (h_max > 0 ? h_max : 1)
  );
  projAnim.x0 = pad;
  projAnim.y0 = projAnim.canvasH - pad - h * projAnim.scale;
  // Remove previous canvas if any
  const container = document.getElementById("projectile-canvas-container");
  if (container) {
    container.innerHTML = "";
  }
  // If p5 instance exists, remove it
  if (window.projP5) {
    window.projP5.remove();
    window.projP5 = null;
  }
  // Create new p5 instance
  window.projP5 = new p5(function(p) {
    p.setup = function() {
      const c = p.createCanvas(projAnim.canvasW, projAnim.canvasH);
      // Attach to container
      const cont = document.getElementById("projectile-canvas-container");
      if (cont) {
        cont.appendChild(c.elt);
      }
      p.frameRate(60);
      projAnim.t = 0;
    };
    p.draw = function() {
      p.background(245);
      // Draw ground
      p.stroke(180);
      p.line(0, projAnim.canvasH - 40, projAnim.canvasW, projAnim.canvasH - 40);
      // Draw launch point
      p.stroke(120);
      p.fill(60, 100, 220);
      // Calculate projectile position at time t
      let t = projAnim.t;
      let x = projAnim.v0x * t;
      let y = projAnim.h + projAnim.v0y * t - 0.5 * projAnim.g * t * t;
      if (y < 0) y = 0;
      // Convert to canvas coordinates
      let px = projAnim.x0 + x * projAnim.scale;
      let py = projAnim.canvasH - 40 - y * projAnim.scale;
      // Draw trajectory
      p.noFill();
      p.stroke(200,100,100, 160);
      p.beginShape();
      for (let tt = 0; tt <= projAnim.t_total; tt += projAnim.t_total / 100) {
        let tx = projAnim.v0x * tt;
        let ty = projAnim.h + projAnim.v0y * tt - 0.5 * projAnim.g * tt * tt;
        if (ty < 0) ty = 0;
        let tpx = projAnim.x0 + tx * projAnim.scale;
        let tpy = projAnim.canvasH - 40 - ty * projAnim.scale;
        p.vertex(tpx, tpy);
      }
      p.endShape();
      // Draw projectile
      p.noStroke();
      p.fill(255, 80, 50);
      p.ellipse(px, py, 16, 16);
      // Draw launch point marker
      p.fill(60, 100, 220, 180);
      p.ellipse(projAnim.x0, projAnim.y0, 10, 10);
      // Draw time text
      p.fill(40);
      p.textSize(14);
      p.text(`t = ${projAnim.t.toFixed(2)} s`, 10, 20);
      // Animate time
      if (projAnim.running) {
        projAnim.t += 1 / 60;
        if (projAnim.t > projAnim.t_total) {
          projAnim.t = projAnim.t_total;
          projAnim.running = false;
        }
      }
    };
  });
}

// --- ENERGY CALCULATOR LOGIC ---
// Existing energy calculator code remains here...

const energyInputContainer = document.getElementById("energy-inputs");
const energyResultContainer = document.getElementById("energy-result");
const energyTypeSelect = document.getElementById("energy-type");

function updateEnergyInputs() {
  if (!energyInputContainer || !energyTypeSelect) return;
  const type = energyTypeSelect.value;
  energyInputContainer.innerHTML = "";
  // Helper to make label/input
  function addInput(labelText, id, attrs = {}) {
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.name = id;
    Object.entries(attrs).forEach(([k, v]) => input.setAttribute(k, v));
    energyInputContainer.appendChild(label);
    energyInputContainer.appendChild(input);
  }
  if (type === "ke") {
    addInput("Mass (m, kg):", "ke-m");
    addInput("Velocity (v, m/s):", "ke-v");
  } else if (type === "gpe") {
    addInput("Mass (m, kg):", "gpe-m");
    addInput("Height (h, m):", "gpe-h");
    addInput("Gravitational Acceleration (g, m/s²):", "gpe-g", { value: "9.8" });
  } else if (type === "epe") {
    addInput("Spring Constant (k, N/m):", "epe-k");
    addInput("Extension (x, m):", "epe-x");
  }
  energyResultContainer.innerHTML = "";
}

function solveEnergy(event) {
  event.preventDefault();
  if (!energyTypeSelect || !energyInputContainer || !energyResultContainer) return;
  const type = energyTypeSelect.value;
  let result, units = "J";
  try {
    if (type === "ke") {
      const m = parseFloat(document.getElementById("ke-m")?.value);
      const v = parseFloat(document.getElementById("ke-v")?.value);
      if (isNaN(m) || isNaN(v)) throw "Please provide mass and velocity.";
      result = 0.5 * m * v * v;
    } else if (type === "gpe") {
      const m = parseFloat(document.getElementById("gpe-m")?.value);
      const h = parseFloat(document.getElementById("gpe-h")?.value);
      let g = parseFloat(document.getElementById("gpe-g")?.value);
      if (isNaN(m) || isNaN(h)) throw "Please provide mass and height.";
      if (isNaN(g)) g = 9.8;
      result = m * g * h;
    } else if (type === "epe") {
      const k = parseFloat(document.getElementById("epe-k")?.value);
      const x = parseFloat(document.getElementById("epe-x")?.value);
      if (isNaN(k) || isNaN(x)) throw "Please provide spring constant and extension.";
      result = 0.5 * k * x * x;
    } else {
      throw "Invalid energy type.";
    }
  } catch (e) {
    energyResultContainer.innerText = `Error: ${e}`;
    return;
  }
  if (isNaN(result)) {
    energyResultContainer.innerText = "Could not compute result.";
    return;
  }
  const sigfig = parseInt(document.getElementById("sigfigs-energy")?.value);
  const formatted = !isNaN(sigfig) && sigfig > 0 ? Number(result).toPrecision(sigfig) : result.toFixed(2);
  energyResultContainer.innerText = `Result: ${formatted} ${units}`;
}

// Event listeners for energy calculator
energyTypeSelect?.addEventListener("change", updateEnergyInputs);
document.getElementById("energy-form")?.addEventListener("submit", solveEnergy);

// Inits
updateKinematicsInputs();
populateUnitDropdowns();
if (typeof updateEnergyInputs === "function") updateEnergyInputs();

// --- MOMENTUM CALCULATOR LOGIC ---
const momentumInputContainer = document.createElement("div");
momentumInputContainer.id = "momentum-inputs";
const momentumForm = document.getElementById("momentum-form");
const momentumTypeSelect = document.getElementById("momentum-type");
const momentumResultContainer = document.getElementById("momentum-result");

function updateMomentumInputs() {
  if (!momentumTypeSelect || !momentumResultContainer) return;
  const type = momentumTypeSelect.value;
  const container = document.getElementById("momentum-inputs");
  if (!container) return;
  container.innerHTML = "";
  function addInput(labelText, id, attrs = {}) {
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.name = id;
    Object.entries(attrs).forEach(([k, v]) => input.setAttribute(k, v));
    container.appendChild(label);
    container.appendChild(input);
  }
  if (type === "momentum") {
    addInput("Mass (m, kg):", "momentum-m");
    addInput("Velocity (v, m/s):", "momentum-v");
  } else if (type === "impulse") {
    addInput("Force (F, N):", "impulse-f");
    addInput("Time Interval (Δt, s):", "impulse-t");
  }
  momentumResultContainer.innerHTML = "";
}

function solveMomentum(event) {
  event.preventDefault();
  if (!momentumTypeSelect || !momentumResultContainer) return;
  const type = momentumTypeSelect.value;
  let result, units;
  try {
    if (type === "momentum") {
      const m = parseFloat(document.getElementById("momentum-m")?.value);
      const v = parseFloat(document.getElementById("momentum-v")?.value);
      if (isNaN(m) || isNaN(v)) throw "Please provide mass and velocity.";
      result = m * v;
      units = "kg·m/s";
    } else if (type === "impulse") {
      const f = parseFloat(document.getElementById("impulse-f")?.value);
      const t = parseFloat(document.getElementById("impulse-t")?.value);
      if (isNaN(f) || isNaN(t)) throw "Please provide force and time interval.";
      result = f * t;
      units = "N·s";
    } else {
      throw "Invalid calculation type.";
    }
  } catch (e) {
    momentumResultContainer.innerText = `Error: ${e}`;
    return;
  }
  if (isNaN(result)) {
    momentumResultContainer.innerText = "Could not compute result.";
    return;
  }
  const sigfig = parseInt(document.getElementById("sigfigs-momentum")?.value);
  const formatted = !isNaN(sigfig) && sigfig > 0 ? Number(result).toPrecision(sigfig) : result.toFixed(2);
  momentumResultContainer.innerText = `Result: ${formatted} ${units}`;
}

// Event listeners for momentum calculator
momentumTypeSelect?.addEventListener("change", updateMomentumInputs);
momentumForm?.addEventListener("submit", solveMomentum);
if (typeof updateMomentumInputs === "function") updateMomentumInputs();


// --- COLLISIONS CALCULATOR LOGIC ---
const collisionInputContainer = document.getElementById("collisions-inputs");
const collisionResultContainer = document.getElementById("collisions-result");
const collisionTypeSelect = document.getElementById("collision-type");

function updateCollisionInputs() {
  if (!collisionInputContainer || !collisionTypeSelect) return;
  const type = collisionTypeSelect.value;
  collisionInputContainer.innerHTML = "";
  function addInput(labelText, id, attrs = {}) {
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.name = id;
    Object.entries(attrs).forEach(([k, v]) => input.setAttribute(k, v));
    collisionInputContainer.appendChild(label);
    collisionInputContainer.appendChild(input);
  }
  // Inputs for two masses and their initial velocities
  addInput("Mass 1 (m₁, kg):", "c-mass1");
  addInput("Velocity 1 (v₁, m/s):", "c-vel1");
  addInput("Mass 2 (m₂, kg):", "c-mass2");
  addInput("Velocity 2 (v₂, m/s):", "c-vel2");
  collisionResultContainer.innerHTML = "";
}

function solveCollision(event) {
  event.preventDefault();
  if (!collisionTypeSelect || !collisionResultContainer) return;
  const type = collisionTypeSelect.value;
  let m1 = parseFloat(document.getElementById("c-mass1")?.value);
  let v1 = parseFloat(document.getElementById("c-vel1")?.value);
  let m2 = parseFloat(document.getElementById("c-mass2")?.value);
  let v2 = parseFloat(document.getElementById("c-vel2")?.value);
  if ([m1, v1, m2, v2].some(x => isNaN(x))) {
    collisionResultContainer.innerText = "Error: Please provide all masses and velocities.";
    return;
  }
  let v1Final, v2Final;
  try {
    if (type === "elastic") {
      // Elastic collision formulas for final velocities
      v1Final = ((m1 - m2) / (m1 + m2)) * v1 + (2 * m2 / (m1 + m2)) * v2;
      v2Final = (2 * m1 / (m1 + m2)) * v1 + ((m2 - m1) / (m1 + m2)) * v2;
    } else if (type === "inelastic") {
      // Perfectly inelastic collision: bodies stick together
      const vFinal = (m1 * v1 + m2 * v2) / (m1 + m2);
      v1Final = vFinal;
      v2Final = vFinal;
    } else {
      throw "Invalid collision type.";
    }
  } catch (e) {
    collisionResultContainer.innerText = `Error: ${e}`;
    return;
  }
  const sigfig = parseInt(document.getElementById("sigfigs-collisions")?.value);
  const format = val => (!isNaN(sigfig) && sigfig > 0) ? Number(val).toPrecision(sigfig) : val.toFixed(2);
  collisionResultContainer.innerText = `Final velocities:\nv₁' = ${format(v1Final)} m/s\nv₂' = ${format(v2Final)} m/s`;
}

// Event listeners for collisions calculator
collisionTypeSelect?.addEventListener("change", updateCollisionInputs);
document.getElementById("collisions-form")?.addEventListener("submit", function(e) {
  e.preventDefault();
  solveCollision(e);
});

// Inits for collision inputs
if (typeof updateCollisionInputs === "function") updateCollisionInputs();

// --- UNIT CONVERTER LOGIC ---
const unitTypes = {
  distance: { units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254 } },
  velocity: { units: { "m/s": 1, "km/h": 1000 / 3600, "ft/s": 0.3048, "mph": 1609.34 / 3600 } },
  acceleration: { units: { "m/s²": 1, "cm/s²": 0.01, "ft/s²": 0.3048 } },
  time: { units: { s: 1, min: 60, h: 3600, ms: 0.001 } },
};

const quantitySelect = document.getElementById("quantity-type");
const fromUnitSelect = document.getElementById("from-unit");
const toUnitSelect = document.getElementById("to-unit");
const inputValue = document.getElementById("input-value");
const resultDisplay = document.getElementById("conversion-result");

// Unit select menus for converter
function populateUnitDropdowns() {
  const type = quantitySelect.value;
  const units = unitTypes[type].units;

  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";

  Object.keys(units).forEach(unit => {
    const opt1 = document.createElement("option");
    opt1.value = unit;
    opt1.textContent = unit;
    fromUnitSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = unit;
    opt2.textContent = unit;
    toUnitSelect.appendChild(opt2);
  });
}

// Converter function
function convertUnit(e) {
  e.preventDefault();
  const type = quantitySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const value = parseFloat(inputValue.value);

  if (isNaN(value)) {
    resultDisplay.innerText = "Please enter a valid number.";
    return;
  }

  const factorFrom = unitTypes[type].units[fromUnit];
  const factorTo = unitTypes[type].units[toUnit];

  const baseValue = value * factorFrom;
  const converted = baseValue / factorTo;

  const sigfig = parseInt(document.getElementById("sigfigs-convert").value);
  const formatted = !isNaN(sigfig) && sigfig > 0 ? Number(converted).toPrecision(sigfig) : converted.toFixed(2);

  resultDisplay.innerText = `${value} ${fromUnit} = ${formatted} ${toUnit}`;
}

// Event Listeners
document.getElementById("solve-for").addEventListener("change", updateKinematicsInputs);
document.getElementById("converter-form").addEventListener("submit", convertUnit);
quantitySelect.addEventListener("change", populateUnitDropdowns);