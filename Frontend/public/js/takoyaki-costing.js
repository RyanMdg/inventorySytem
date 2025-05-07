// --- Constants ---
const ingredients = [
  { name: "Flour", price: 80, quantity: 5 },
  { name: "Egg", price: 210, quantity: 1 },
  { name: "Sauce", price: 390, quantity: 0.75 },
  { name: "Cheese Sauce", price: 94, quantity: 1 },
  { name: "Octo", price: 250, quantity: 0.75 },
  { name: "Ham", price: 160, quantity: 1 },
  { name: "Cheese Cubes", price: 107, quantity: 5 },
  { name: "Mayo", price: 100, quantity: 1.5 },
  { name: "Toppings", price: 50, quantity: 1 },
  { name: "Oil", price: 67, quantity: 0.5 },
  { name: "Gas", price: 90, quantity: 1 },
  { name: "Styro's / Cup", price: 120, quantity: 1 },
  { name: "Veggies", price: 60, quantity: 0.5 },
  { name: "Leeks", price: 120, quantity: 0.25 },
  { name: "Garlic", price: 20, quantity: 1 },
  { name: "Powder Shrimp", price: 350, quantity: 0.1 },
];
const ballsPerBatch = 742;

// --- Menu Items Array (initial menu) ---
let menuItems = [
  { variant: "42s", size: 42, price: 450, count: 17 },
  { variant: "20s", size: 20, price: 205, count: 0 },
  { variant: "16s", size: 16, price: 160, count: 1 },
  { variant: "12s", size: 12, price: 125, count: 1 },
  { variant: "8s", size: 8, price: 80, count: 0 },
  { variant: "4s", size: 4, price: 45, count: 0 },
];

// --- Store original margins ---
const menuPrices = {
  OCTO: { "4s": 45, "8s": 80, "12s": 125, "16s": 160 },
  "HAM & CHEESE": { "4s": 45, "8s": 80, "12s": 125, "16s": 160 },
  CHEESE: { "8s": 80, "12s": 125, "16s": 160 },
  "MIX #3": { "8s": 80, "12s": 125, "16s": 160 },
  TAKOPARTY: { "20s": 205, "42s": 450 },
};
const servingSizes = {
  "4s": 4,
  "8s": 8,
  "12s": 12,
  "16s": 16,
  "20s": 20,
  "42s": 42,
};
const originalMargins = {};
(function computeOriginalMargins() {
  const originalCostPerBall = calculateTotalBatchCost() / ballsPerBatch;
  Object.keys(menuPrices).forEach((variant) => {
    Object.keys(menuPrices[variant]).forEach((size) => {
      const menuPrice = menuPrices[variant][size];
      const balls = servingSizes[size];
      if (!balls) return;
      const totalCost = originalCostPerBall * balls;
      const profit = menuPrice - totalCost;
      const margin = profit / menuPrice;
      if (!originalMargins[variant]) originalMargins[variant] = {};
      originalMargins[variant][size] = margin;
    });
  });
})();

// --- DOM Elements ---
const ingredientTableBody = document.getElementById("ingredient-table-body");
const costPerBallSpan = document.getElementById("cost-per-ball");
const menuTableBody = document.getElementById("menu-table-body");

// --- Functions ---
function renderIngredientTable() {
  ingredientTableBody.innerHTML = "";
  ingredients.forEach((ing, idx) => {
    const totalCost = ing.price * ing.quantity;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class=\"p-2\">${ing.name}</td>
      <td class=\"p-2\"><input type=\"number\" min=\"0\" step=\"0.01\" value=\"${
        ing.price
      }\" data-idx=\"${idx}\" data-type=\"price\" class=\"ingredient-input border rounded px-2 py-1 w-24\" /></td>
      <td class=\"p-2\"><input type=\"number\" min=\"0\" step=\"0.01\" value=\"${
        ing.quantity
      }\" data-idx=\"${idx}\" data-type=\"quantity\" class=\"ingredient-input border rounded px-2 py-1 w-24\" /></td>
      <td class=\"p-2\">₱${totalCost.toFixed(2)}</td>
    `;
    ingredientTableBody.appendChild(row);
  });
}

function calculateTotalBatchCost() {
  return ingredients.reduce((sum, ing) => sum + ing.price * ing.quantity, 0);
}

function calculateDynamicCostPerBall() {
  return calculateTotalBatchCost() / ballsPerBatch;
}

function calculateSuggestedMenuPrice(
  costPerBall,
  ballsPerServing,
  originalMargin
) {
  // New Menu Price = Cost / (1 - Original Margin)
  return (costPerBall * ballsPerServing) / (1 - originalMargin);
}

function calculateProfitPerServing(costPerBall, menuPrice, ballsPerServing) {
  const totalCost = costPerBall * ballsPerServing;
  const profit = menuPrice - totalCost;
  const profitMargin = (profit / menuPrice) * 100;
  return {
    totalCost: totalCost.toFixed(2),
    profit: profit.toFixed(2),
    profitMargin: profitMargin.toFixed(2),
  };
}

function renderMenuTable(costPerBall) {
  menuTableBody.innerHTML = "";
  Object.keys(menuPrices).forEach((variant) => {
    Object.keys(menuPrices[variant]).forEach((size) => {
      const origMenuPrice = menuPrices[variant][size];
      const balls = servingSizes[size];
      if (!balls) return;
      const origMargin = originalMargins[variant][size];
      const suggestedMenuPrice = calculateSuggestedMenuPrice(
        costPerBall,
        balls,
        origMargin
      );
      const { totalCost, profit, profitMargin } = calculateProfitPerServing(
        costPerBall,
        suggestedMenuPrice,
        balls
      );
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class=\"p-2\">${variant}</td>
        <td class=\"p-2\">${size}</td>
        <td class=\"p-2\">₱${origMenuPrice}</td>
        <td class=\"p-2\">₱${suggestedMenuPrice.toFixed(2)}</td>
        <td class=\"p-2\" title=\"Raw Cost: Total ingredient cost for this serving size\">₱${totalCost}</td>
        <td class=\"p-2\" title=\"Profit = Revenue (Selling Price) - Raw Cost\">₱${profit}</td>
        <td class=\"p-2\" title=\"Profit Margin = (Profit / Revenue) × 100\">${profitMargin}%</td>
      `;
      menuTableBody.appendChild(row);
    });
  });
}

function calculateAverageSuggestedSellingPrice(costPerBall) {
  // Use all menu items and sizes to get the average suggested selling price per ball
  let totalSuggested = 0;
  let totalBalls = 0;
  Object.keys(menuPrices).forEach((variant) => {
    Object.keys(menuPrices[variant]).forEach((size) => {
      const balls = servingSizes[size];
      if (!balls) return;
      const origMargin = originalMargins[variant][size];
      const suggestedMenuPrice = calculateSuggestedMenuPrice(
        costPerBall,
        balls,
        origMargin
      );
      totalSuggested += suggestedMenuPrice;
      totalBalls += balls;
    });
  });
  return totalBalls > 0 ? totalSuggested / totalBalls : 0;
}

// Store last calculated gross sales from set planner
let lastPlannerGrossSales = 0;

// --- Render Dynamic Set Planner ---
function renderSetPlanner() {
  const plannerDiv = document.getElementById("dynamic-set-planner");
  plannerDiv.innerHTML = `
    <table class="min-w-full border rounded-lg overflow-hidden mb-2">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2">Variant</th>
          <th class="p-2">Size</th>
          <th class="p-2">Price/Set (₱)</th>
          <th class="p-2">How Many Sets?</th>
          <th class="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        ${menuItems
          .map(
            (item, idx) => `
          <tr>
            <td class="p-2">${item.variant}</td>
            <td class="p-2">${item.size}</td>
            <td class="p-2">₱${item.price}</td>
            <td class="p-2">
              <input type="number" min="0" value="${item.count}" data-menu-idx="${idx}" class="menu-set-input border rounded px-2 py-1 w-20" />
            </td>
            <td class="p-2">
              <button data-delete-idx="${idx}" class="delete-menu-btn text-white bg-red-500 hover:bg-red-700 rounded px-2 py-1">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    <div class="flex flex-wrap gap-6 items-center mt-2">
      <span class="font-semibold">Total Balls:</span>
      <span id="planner-total-balls" class="text-lg font-bold text-blue-600"></span>
      <span id="planner-warning" class="text-red-600 font-semibold"></span>
    </div>
  `;
}

function setupDeleteMenuListeners() {
  document.querySelectorAll(".delete-menu-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.getAttribute("data-delete-idx"));
      menuItems.splice(idx, 1);
      renderSetPlanner();
      setupSetPlannerListeners();
      setupDeleteMenuListeners();
      updateSetPlanner();
    });
  });
}

// --- Add Menu Item Logic ---
function addMenuItem(variant, size, price) {
  menuItems.push({
    variant,
    size: parseInt(size),
    price: parseFloat(price),
    count: 0,
  });
  renderSetPlanner();
  setupSetPlannerListeners();
  setupDeleteMenuListeners();
  updateSetPlanner();
}

function setupAddMenuForm() {
  const btn = document.getElementById("add-menu-btn");
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const variant = document.getElementById("new-menu-variant").value.trim();
    const size = document.getElementById("new-menu-size").value;
    const price = document.getElementById("new-menu-price").value;
    if (!variant || size === "" || price === "") {
      alert("Please fill in all fields.");
      return;
    }
    addMenuItem(variant, size, price);
    document.getElementById("new-menu-variant").value = "";
    document.getElementById("new-menu-size").value = "";
    document.getElementById("new-menu-price").value = "";
  });
}

// --- Update Set Planner and Summary ---
function updateSetPlanner() {
  let totalBalls = 0;
  let grossSales = 0;
  document.querySelectorAll(".menu-set-input").forEach((input) => {
    const idx = parseInt(input.getAttribute("data-menu-idx"));
    const count = parseInt(input.value) || 0;
    menuItems[idx].count = count;
    totalBalls += count * menuItems[idx].size;
    grossSales += count * menuItems[idx].price;
  });
  document.getElementById("planner-total-balls").textContent = totalBalls;
  lastPlannerGrossSales = grossSales;
  const warning = document.getElementById("planner-warning");
  if (totalBalls !== 742) {
    warning.textContent = `Total balls is not 742!`;
  } else {
    warning.textContent = "";
  }
  updateSummary(calculateDynamicCostPerBall());
}

function setupSetPlannerListeners() {
  document.querySelectorAll(".menu-set-input").forEach((input) => {
    input.addEventListener("input", updateSetPlanner);
  });
}

function updateSummary(costPerBall) {
  const totalRawCost = calculateTotalBatchCost();
  const rawCostSpan = document.getElementById("summary-raw-cost");
  if (rawCostSpan) rawCostSpan.textContent = `₱${totalRawCost.toFixed(2)}`;

  // Use gross sales from set planner
  const grossSales = lastPlannerGrossSales;
  const grossSalesSpan = document.getElementById("summary-gross-sales");
  if (grossSalesSpan)
    grossSalesSpan.textContent = `₱${grossSales.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const netSales = grossSales - totalRawCost;
  const netSalesSpan = document.getElementById("summary-net-sales");
  if (netSalesSpan) netSalesSpan.textContent = `₱${netSales.toFixed(2)}`;

  // Utilities and Salaries
  const utilitiesInput = document.getElementById("summary-utilities");
  const salariesInput = document.getElementById("summary-salaries");
  const utilities = utilitiesInput ? parseFloat(utilitiesInput.value) || 0 : 0;
  const salaries = salariesInput ? parseFloat(salariesInput.value) || 0 : 0;

  const profit = netSales - utilities - salaries;
  const profitSpan = document.getElementById("summary-profit");
  if (profitSpan) profitSpan.textContent = `₱${profit.toFixed(2)}`;
}

function updateAll() {
  const costPerBall = calculateDynamicCostPerBall();
  costPerBallSpan.textContent = `₱${costPerBall.toFixed(2)}`;
  renderMenuTable(costPerBall);
  // Update total raw cost for 742 balls
  const totalRawCost = calculateTotalBatchCost();
  const totalRawCostSpan = document.getElementById("total-raw-cost");
  if (totalRawCostSpan)
    totalRawCostSpan.textContent = `₱${totalRawCost.toFixed(2)}`;
  // Re-render ingredient table to update total cost per ingredient
  renderIngredientTable();
  // Update summary section
  updateSummary(costPerBall);
}

// --- Event Listeners ---
function setupInputListeners() {
  ingredientTableBody.addEventListener("input", (e) => {
    const target = e.target;
    if (target.classList.contains("ingredient-input")) {
      const idx = parseInt(target.getAttribute("data-idx"));
      const type = target.getAttribute("data-type");
      const value = parseFloat(target.value) || 0;
      if (type === "price") ingredients[idx].price = value;
      if (type === "quantity") ingredients[idx].quantity = value;
      updateAll();
    }
  });
  // Listen for changes in utilities and salaries
  const utilitiesInput = document.getElementById("summary-utilities");
  const salariesInput = document.getElementById("summary-salaries");
  if (utilitiesInput) utilitiesInput.addEventListener("input", updateAll);
  if (salariesInput) salariesInput.addEventListener("input", updateAll);
}

function addIngredient(name, price, quantity) {
  ingredients.push({
    name,
    price: parseFloat(price),
    quantity: parseFloat(quantity),
  });
  renderIngredientTable();
  updateAll();
}

function setupAddIngredientForm() {
  const btn = document.getElementById("add-ingredient-btn");
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const name = document.getElementById("new-ingredient-name").value.trim();
    const price = document.getElementById("new-ingredient-price").value;
    const qty = document.getElementById("new-ingredient-qty").value;
    if (!name || price === "" || qty === "") {
      alert("Please fill in all fields.");
      return;
    }
    addIngredient(name, price, qty);
    // Clear fields
    document.getElementById("new-ingredient-name").value = "";
    document.getElementById("new-ingredient-price").value = "";
    document.getElementById("new-ingredient-qty").value = "";
  });
}

// --- Initialize ---
renderIngredientTable();
setupInputListeners();
updateAll();
renderSetPlanner();
setupAddMenuForm();
setupSetPlannerListeners();
setupDeleteMenuListeners();
updateSetPlanner();
