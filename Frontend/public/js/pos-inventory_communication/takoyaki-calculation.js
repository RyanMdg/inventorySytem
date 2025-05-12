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
export async function calculateDynamicCostPerBall() {
  const { branchId } = await getAuthUserAndBranch();
  const { data: mixturedata } = await supabase
    .from("recipe_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId);

    const costPerBall =
    mixturedata.reduce((sum, ing) => sum + ing.prices * ing.quantity, 0) /
    ballsPerBatch;

    console.log(`the cost per ball is ${costPerBall}`);

  return costPerBall;
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
    .from("recipe_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId);

  // Fetch menu items dynamically from Supabase, including original_margin
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("name, quantity, price, original_margin,id")
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
    // Use user margin if set, else original margin from DB
    let marginToUse =
      item.original_margin !== null && item.original_margin !== undefined
        ? item.original_margin
        : 0.3;
    const suggestedSellingPrice = rawCost / (1 - marginToUse);
    const profit = suggestedSellingPrice - rawCost;
    const profitMargin =
      suggestedSellingPrice > 0 ? (profit / suggestedSellingPrice) * 100 : 0;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class=\"px-4 text-center py-2\">${ballsInServing}s</td>
      <td class=\"px-4 text-center py-2\">₱${origMenuPrice}</td>
      <td class=\"px-4 text-center py-2\">₱${suggestedSellingPrice.toFixed(
        2
      )}</td>
      <td class=\"px-4 text-center py-2\">₱${rawCost.toFixed(2)}</td>
      <td class=\"px-4 text-center py-2\">₱${profit.toFixed(2)}</td>
      <td class=\"px-4 text-center py-2\">${profitMargin.toFixed(2)}%</td>
      <td class=\"px-4 text-center py-2\"><button onclick=\"deleteMenuItem(${
        item.id
      })\" class=\"text-white rounded px-2 py-1\">🗑️</button></td>
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
    .from("recipe_table")
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
      <td id="quantity" class=\"px-4 text-center py-2\"><input type=\"number\" min=\"0\" step=\"0.01\" value=\"${Number(
        ing.quantity
      ).toFixed(
        2
      )}\" data-idx=\"${idx}\" data-type=\"quantity\" class=\"ingredient-input border rounded px-2 py-1 w-24\" /></td>
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

export async function calculateTotalBatchCost() {
  const { branchId } = await getAuthUserAndBranch();
  console.log("Current branchId:", branchId);

  const { data: mixturedata, error: mixtureError } = await supabase
    .from("mixtures_table")
    .select("raw_mats,prices,quantity")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (mixtureError) {
    console.error("Error fetching mixture data:", mixtureError);
    return 0;
  }

  console.log("Mixture data from database:", mixturedata);
  
  const totalCost = mixturedata.reduce((sum, ing) => {
    const itemCost = ing.prices * ing.quantity;
    console.log(`Cost for ${ing.raw_mats}: ${ing.prices} * ${ing.quantity} = ${itemCost}`);
    return sum + itemCost;
  }, 0);
  
  console.log("Total batch cost:", totalCost);
  return totalCost;
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

      // Update the recipe_table (not mixtures_table)
      const { error, data } = await supabase
        .from("recipe_table")
        .update({
          [type === "price" ? "prices" : "quantity"]: value,
        })
        .eq("branch_id", branchId)
        .eq("raw_mats", rawMats);

      if (error) {
        console.error("Error updating recipe:", error);
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
          .from("recipe_table")
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

// Add menu item functionality
const addMenuItemForm = document.getElementById("add-menu-item-form");
if (addMenuItemForm) {
  addMenuItemForm.innerHTML = `
    <input id="new-menu-size" type="number" min="1" placeholder="Size (e.g. 4)" class="border rounded px-2 py-1 w-36" required />
    <input id="new-menu-price" type="number" min="0" step="0.01" placeholder="Price (₱)" class="border rounded px-2 py-1 w-36" required />
    <input id="new-menu-margin" type="number" min="0" max="99.9999" step="0.0001" placeholder="e.g. 0.3000 or 30" class="border rounded px-2 py-1 w-36" required />
    <button type="submit" class="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-1">Add Menu Price</button>
  `;
  addMenuItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sizeInput = document.getElementById("new-menu-size");
    const priceInput = document.getElementById("new-menu-price");
    const marginInput = document.getElementById("new-menu-margin");
    const size = parseInt(sizeInput.value);
    const price = parseFloat(priceInput.value);
    let margin = parseFloat(marginInput.value);
    if (!size || !price || isNaN(margin)) return;
    // If margin > 1, treat as percent and convert to decimal
    if (margin > 1) margin = margin / 100;
    // Always store as float with up to 4 decimals
    margin = parseFloat(margin.toFixed(4));
    const { branchId } = await getAuthUserAndBranch();
    await supabase.from("menu_items").insert([
      {
        name: `${size}s`,
        quantity: size,
        price: price,
        original_margin: margin,
        branch_id: branchId,
      },
    ]);
    sizeInput.value = "";
    priceInput.value = "";
    marginInput.value = "";
    await renderMenuTable();
  });
}

// Delete menu item functionality
window.deleteMenuItem = async function (id) {
  const { branchId } = await getAuthUserAndBranch();
  await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)
    .eq("branch_id", branchId);
  await renderMenuTable();
};

// Spinner helpers (Tailwind)
function showSpinner() {
  let spinner = document.getElementById("loading-spinner");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "loading-spinner";
    spinner.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50";
    spinner.innerHTML = `
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="mt-4 text-lg font-semibold text-red-600">Processing...</span>
      </div>
    `;
    document.body.appendChild(spinner);
  }
  spinner.style.display = "flex";
}
function hideSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.style.display = "none";
}

// Deduct ingredients for a sale and update UI/alert if any are zero
export async function deductIngredientsForSale(ballsSold) {
  showSpinner();
  try {
    const { branchId } = await getAuthUserAndBranch();
    const { data: mixturedata } = await supabase
      .from("mixtures_table")
      .select("raw_mats, prices, quantity")
      .eq("branch_id", branchId);

    let anyZero = false;
    // Prepare all update promises
    const updatePromises = mixturedata.map((ing) => {
      const deductAmount = ing.quantity * (ballsSold / ballsPerBatch);
      const newQty = ing.quantity - deductAmount;
      if (newQty <= 0) anyZero = true;
      return supabase
        .from("mixtures_table")
        .update({ quantity: newQty })
        .eq("branch_id", branchId)
        .eq("raw_mats", ing.raw_mats);
    });

    // Run all updates in parallel
    await Promise.all(updatePromises);

    // Optimistically update the UI
    renderIngredientTable();

    if (anyZero) {
      dynamicAlert(
        "Mixture Zero!",
        "One or more ingredients have run out. Please restock."
      );
    }
  } finally {
    hideSpinner();
  }
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
