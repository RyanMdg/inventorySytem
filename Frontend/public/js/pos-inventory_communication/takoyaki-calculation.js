import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";


const ingredientTableBody = document.getElementById("ingredient-table-body");

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

// Constants for takoyaki costing
const ballsPerBatch = 742;
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

// --- Compute originalMargins ONCE from the hardcoded ingredients array ---
const originalMargins = {};
(function computeOriginalMargins() {
  const originalCostPerBall = ingredients.reduce((sum, ing) => sum + ing.price * ing.quantity, 0) / ballsPerBatch;
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

// Menu table elements
const menuTableBody = document.getElementById("menu-table-body");
const costPerBallSpan = document.getElementById("cost-per-ball");

/**
 * Calculates the cost per individual takoyaki ball
 * Formula: Total batch cost ÷ Number of balls per batch (742)
 * @returns {number} Cost per individual takoyaki ball
 */
async function calculateDynamicCostPerBall() {
  const totalCost = await calculateTotalBatchCost();
  return totalCost / ballsPerBatch;
}

/**
 * Calculates the suggested selling price for a menu item
 * Formula: (Cost per ball × Number of balls in serving) ÷ (1 - Original profit margin)
 */
function calculateSuggestedMenuPrice(costPerBall, ballsPerServing, targetMargin) {
  const rawCost = costPerBall * ballsPerServing;
  return rawCost / (1 - targetMargin);
}

/**
 * Calculates profit metrics for a serving size
 */
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

/**
 * Renders the menu table with prices and profit calculations
 */
export async function renderMenuTable() {
  const costPerBall = await calculateDynamicCostPerBall();
  menuTableBody.innerHTML = "";

  const showPairs = [
    { variant: "OCTO", size: "4s" },
    { variant: "HAM & CHEESE", size: "8s" },
    { variant: "MIX #3", size: "12s" },
    { variant: "CHEESE", size: "16s" },
    { variant: "TAKOPARTY", size: "20s" },
    { variant: "TAKOPARTY", size: "42s" },
  ];

  showPairs.forEach(({ variant, size }) => {
    if (menuPrices[variant] && menuPrices[variant][size]) {
      const origMenuPrice = menuPrices[variant][size];
      const balls = servingSizes[size];
      const origMargin = originalMargins[variant]?.[size];
      if (
        typeof origMenuPrice !== 'number' ||
        typeof balls !== 'number' ||
        typeof origMargin !== 'number' ||
        isNaN(costPerBall) ||
        isNaN(origMargin)
      ) {
        // error row
        return;
      }
      const suggestedMenuPrice = (costPerBall * balls) / (1 - origMargin);
      const rawCost = costPerBall * balls;
      const profit = suggestedMenuPrice - rawCost;
      const profitMargin = (profit / suggestedMenuPrice) * 100;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 text-center py-2">${size}</td>
        <td class="px-4 text-center py-2">₱${origMenuPrice}</td>
        <td class="px-4 text-center py-2">₱${suggestedMenuPrice.toFixed(2)}</td>
        <td class="px-4 text-center py-2">₱${rawCost.toFixed(2)}</td>
        <td class="px-4 text-center py-2">₱${profit.toFixed(2)}</td>
        <td class="px-4 text-center py-2">${profitMargin.toFixed(2)}%</td>
      `;
      menuTableBody.appendChild(row);
    }
  });

  if (costPerBallSpan) {
    costPerBallSpan.textContent = `₱${costPerBall.toFixed(2)}`;
  }
}

// Update the renderIngredientTable function to also update menu calculations
export async function renderIngredientTable() {
  const { branchId } = await getAuthUserAndBranch();

  const {data:mixturedata , error:mixtureError} = await supabase
    .from("mixtures_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id",branchId);

  ingredientTableBody.innerHTML = "";
  let totalRawCost = 0;
  
  mixturedata.forEach((ing, idx) => {
    const totalCost = ing.prices * ing.quantity;
    totalRawCost += totalCost;
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td id="raws" class=\"px-4 text-center py-2\">${ing.raw_mats}</td>
      <td id="prices" class=\"px-4 text-center py-2\"><input type=\"number\" min=\"0\" step=\"0.01\" value=\"${
        ing.prices
      }\" data-idx=\"${idx}\" data-type=\"price\" class=\"ingredient-input border rounded px-2 py-1 w-24\" /></td>
      <td id="quantity" class=\"px-4 text-center py-2\"><input type=\"number\" min=\"0\" step=\"0.01\" value=\"${
        ing.quantity
      }\" data-idx=\"${idx}\" data-type=\"quantity\" class=\"ingredient-input border rounded px-2 py-1 w-24\" /></td>
      <td id="total" class=\"px-4 text-center py-2\">₱${totalCost.toFixed(2)}</td>
      <td class=\"px-4 text-center py-2\">
        <button class=\"delete-mixture-btn\" data-raw=\"${ing.raw_mats}\" title=\"Delete\">🗑️</button>
      </td>
    `;
    ingredientTableBody.appendChild(row);
  });

  // Update the total raw materials cost
  const totalRawMatElement = document.getElementById("sum");
  if (totalRawMatElement) {
    totalRawMatElement.textContent = `₱${totalRawCost.toFixed(2)}`;
  }

  // Update menu calculations
  await renderMenuTable();
}

async function calculateTotalBatchCost() {
  const { branchId } = await getAuthUserAndBranch();

  const {data:mixturedata , error:mixtureError} =  await supabase
  .from("mixtures_table")
  .select("raw_mats,prices,quantity")
  .eq("branch_id",branchId)
  
  return mixturedata.reduce((sum, ing) => sum + ing.prices * ing.quantity, 0);
}

// Add event listener setup function
function setupInputListeners() {
  ingredientTableBody.addEventListener("input", async (e) => {
    const target = e.target;
    if (target.classList.contains("ingredient-input")) {
      const idx = parseInt(target.getAttribute("data-idx"));
      const type = target.getAttribute("data-type");
      const value = parseFloat(target.value) || 0;
      const { branchId } = await getAuthUserAndBranch();

      // Get the raw material name from the row
      const row = target.closest('tr');
      const rawMats = row.querySelector('#raws').textContent;

      // Update the database
      const { error, data } = await supabase
        .from("mixtures_table")
        .update({ 
          [type === "price" ? "prices" : "quantity"]: value 
        })
        .eq("branch_id", branchId)
        .eq("raw_mats", rawMats);

      if (error) {
        console.error("Error updating mixture:", error);
        return;
      }
      console.log("Update result:", data);

      // Wait a short moment to ensure DB is updated (optional)
      await new Promise(res => setTimeout(res, 200));

      // Re-render the table to show updated values
      await renderIngredientTable();
    }
  });
}

function setupDeleteListeners() {
  ingredientTableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-mixture-btn")) {
      const rawMats = e.target.getAttribute("data-raw");
      const { branchId } = await getAuthUserAndBranch();
      if (confirm(`Are you sure you want to delete "${rawMats}"?`)) {
        const { error } = await supabase
          .from("mixtures_table")
          .delete()
          .eq("branch_id", branchId)
          .eq("raw_mats", rawMats);
        if (error) {
          alert("Failed to delete: " + error.message);
        } else {
          await renderIngredientTable();
        }
      }
    }
  });
}

// Initialize the table and set up listeners
(async () => {
  await renderIngredientTable();
  setupInputListeners();
  setupDeleteListeners();
  // Log the total batch cost
  const totalCost = await calculateTotalBatchCost();
  console.log(`Total Batch Cost: ₱${totalCost.toFixed(2)}`);
})();
