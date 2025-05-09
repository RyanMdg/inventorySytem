import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";

const ingredientTableBody = document.getElementById("ingredient-table-body");

// Constants for takoyaki costing
const ballsPerBatch = 742;

// Menu table elements
const menuTableBody = document.getElementById("menu-table-body");
const costPerBallSpan = document.getElementById("cost-per-ball");

// Static menu items array
const menuItems = [
  { name: "4s", quantity: 4, price: 45 },
  { name: "8s", quantity: 8, price: 80 },
  { name: "12s", quantity: 12, price: 125 },
  { name: "16s", quantity: 16, price: 160 },
  { name: "20s", quantity: 20, price: 205 },
  { name: "42s", quantity: 42, price: 450 },
];

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
function calculateSuggestedMenuPrice(costPerBall, ballsPerServing, profit) {
  const rawCost = costPerBall * ballsPerServing;
  return rawCost + profit;
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
 * Renders the menu table with prices and profit calculations using dynamic cost per ball and menuItems.quantity
 */
export async function renderMenuTable() {
  // Fetch dynamic ingredients data
  const { branchId } = await getAuthUserAndBranch();
  const { data: mixturedata } = await supabase
    .from("mixtures_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId);

  // Fetch menu items dynamically from Supabase, including original_margin
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("name, quantity, price, original_margin")
    .eq("branch_id", branchId);

  // Calculate dynamic cost per ball
  const costPerBall =
    mixturedata.reduce((sum, ing) => sum + ing.prices * ing.quantity, 0) /
    ballsPerBatch;

  menuTableBody.innerHTML = "";

  menuItems.forEach((item) => {
    const ballsInServing = item.quantity;
    const origMenuPrice = item.price;
    const rawCost = costPerBall * ballsInServing;
    // Use the stored original margin from the DB
    const origMargin =
      item.original_margin !== null && item.original_margin !== undefined
        ? item.original_margin
        : 0.3; // fallback if missing
    const suggestedSellingPrice = rawCost / (1 - origMargin);
    const profit = suggestedSellingPrice - rawCost;
    const profitMargin =
      suggestedSellingPrice > 0 ? (profit / suggestedSellingPrice) * 100 : 0;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 text-center py-2">${ballsInServing}s</td>
      <td class="px-4 text-center py-2">₱${origMenuPrice}</td>
      <td class="px-4 text-center py-2">₱${suggestedSellingPrice.toFixed(
        2
      )}</td>
      <td class="px-4 text-center py-2">₱${rawCost.toFixed(2)}</td>
      <td class="px-4 text-center py-2">₱${profit.toFixed(2)}</td>
      <td class="px-4 text-center py-2">${profitMargin.toFixed(2)}%</td>
    `;
    menuTableBody.appendChild(row);
  });

  if (costPerBallSpan) {
    costPerBallSpan.textContent = `₱${costPerBall.toFixed(2)}`;
  }
}

// Update the renderIngredientTable function to also update menu calculations
export async function renderIngredientTable() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: mixturedata, error: mixtureError } = await supabase
    .from("mixtures_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId);

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
      <td id="total" class=\"px-4 text-center py-2\">₱${totalCost.toFixed(
        2
      )}</td>
      <td class=\"px-4 text-center py-2\">
        <button class=\"delete-mixture-btn\" data-raw=\"${
          ing.raw_mats
        }\" title=\"Delete\">🗑️</button>
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

  const { data: mixturedata, error: mixtureError } = await supabase
    .from("mixtures_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId);

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
      const row = target.closest("tr");
      const rawMats = row.querySelector("#raws").textContent;

      // Update the database
      const { error, data } = await supabase
        .from("mixtures_table")
        .update({
          [type === "price" ? "prices" : "quantity"]: value,
        })
        .eq("branch_id", branchId)
        .eq("raw_mats", rawMats);

      if (error) {
        console.error("Error updating mixture:", error);
        return;
      }
      console.log("Update result:", data);

      // Wait a short moment to ensure DB is updated (optional)
      await new Promise((res) => setTimeout(res, 200));

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
          dynamicAlert("Delete Failed", error.message);
        } else {
          await renderIngredientTable();
          dynamicAlert(
            "Deleted!",
            `Mixture '${rawMats}' was deleted successfully.`
          );
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
