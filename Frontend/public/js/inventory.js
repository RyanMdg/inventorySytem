"use strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const raw = document.getElementById("raw");
const createRaw = document.getElementById("createRaw");
const pcs = document.getElementById("qty");
const createPcs = document.getElementById("createQty");
const unit = document.getElementById("unit");
const createUnit = document.getElementById("createUnit");
const prices = document.getElementById("price");
const expdate = document.getElementById("expDate");
const totalDisplay = document.querySelector(".total p");
const createdtotal = document.querySelector(".createdTotal p");
const inventoryData = document.getElementById("inventory-data");
const CreateinventoryData = document.getElementById("create-inventory-data");

const updateBtn = document.querySelector(".updatebtn");
const createbtn = document.querySelector(".createBtn");
const addToStack = document.querySelector(".addbtn");

let inventoryid = "";
addToStack.addEventListener("click", async function () {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to add a product.");
    return;
  }

  const userId = user.user.id; // Logged-in user's ID

  // Get User's Branch ID
  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching branch ID:", userError?.message);
    alert("Could not retrieve branch details.");
    return;
  }

  const branchId = userData.branch_id;
  const totalPrice = parseFloat(prices.value) * parseFloat(pcs.value);

  const { data: addStock, error: errorAddStock } = await supabase
    .from("inventory_table")
    .insert([
      {
        branch_id: branchId,
        raw_mats: raw.value,
        quantity: pcs.value,
        unit: unit.value,
        prices: parseFloat(prices.value), // Ensure numeric values
        exp_date: expdate.value,
        total: totalPrice.toFixed(2),
      },
    ])
    .select("id")
    .single();

  if (errorAddStock) {
    console.error("Error adding stock:", errorAddStock?.message);
    alert("Failed to add the stock");
    return;
  }

  inventoryid += addStock.id;

  alert(`Stock added successfully`);
  renderOngoingOrders(); // Refresh table immediately

  raw.value = "";
  pcs.value = "";
  unit.value = "";
  prices.value = "";
  expdate.value = "";
  totalDisplay.textContent = "0.00";
});

createbtn.addEventListener("click", async function () {
  // Ensure user is logged in
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to create a mixture.");
    return;
  }

  const userId = user.user.id;

  // Fetch User's Branch ID
  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching branch ID:", userError?.message);
    alert("Could not retrieve branch details.");
    return;
  }

  const branchId = userData.branch_id;

  // Fetch current stock levels
  const { data: stockData, error: stockError } = await supabase
    .from("inventory_table")
    .select("quantity, raw_mats")
    .eq("branch_id", branchId)
    .eq("raw_mats", createRaw.value)
    .single();

  if (stockError || !stockData) {
    console.error("Error fetching stock:", stockError?.message);
    alert("Raw material not found in inventory.");
    return;
  }

  const availableQty = stockData.quantity;
  const requiredQty = parseFloat(createPcs.value);

  // Validate stock availability
  if (requiredQty > availableQty) {
    alert("Not enough stock available for this mixture.");
    return;
  }

  // Calculate new stock after deduction
  const newStock = availableQty - requiredQty;

  // Update inventory table to deduct stock
  const { error: updateError } = await supabase
    .from("inventory_table")
    .update({ quantity: newStock })
    .eq("branch_id", branchId)
    .eq("raw_mats", createRaw.value);

  if (updateError) {
    console.error("Error updating stock:", updateError?.message);
    alert("Failed to deduct stock.");
    return;
  }

  // Insert new mixture into the database
  const { data: addMixture, error: mixtureError } = await supabase
    .from("mixtures_table") // Separate table for created mixtures
    .insert([
      {
        branch_id: branchId,
        raw_mats: createRaw.value,
        quantity: requiredQty,
        unit: createUnit.value,
        created_at: new Date(),
      },
    ])
    .single();

  if (mixtureError) {
    console.error("Error adding mixture:", mixtureError?.message);
    alert("Failed to add mixture.");
    return;
  }

  alert("Mixture created successfully!");

  // Refresh UI
  renderOngoingOrders();
  rendercreatedMixtures();

  // Reset fields
  createRaw.value = "";
  createPcs.value = "";
  createUnit.value = "";
  createdtotal.textContent = "0.00";
});

async function renderOngoingOrders() {
  const { data, error } = await supabase
    .from("inventory_table")
    .select("total, quantity, unit, raw_mats, prices, exp_date");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  inventoryData.innerHTML = ""; // Clear previous table data

  data.forEach((item) => {
    inventoryData.innerHTML += `
      <tr>
        <td contentEditable="false"  class="raw-mats inventoryContent px-4 py-2">${item.raw_mats}</td>
        <td contentEditable="false"  class="exp-date inventoryContent px-4 py-2">${item.exp_date}</td>
        <td contentEditable="false"  class="quantity inventoryContent px-4 py-2">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure inventoryContent px-4 py-2">${item.unit}</td>
        <td contentEditable="false" id=""  class="price inventoryContent px-4 py-2">${item.prices}</td>
        <td  class="px-4 py-2">${item.total}</td>
      </tr>
    `;
  });
}

async function rendercreatedMixtures() {
  const { data, error } = await supabase
    .from("inventory_table")
    .select("total, quantity, unit, raw_mats, prices, exp_date");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  CreateinventoryData.innerHTML = ""; // Clear previous table data

  data.forEach((item) => {
    CreateinventoryData.innerHTML += `
      <tr>
        <td contentEditable="false"  class="raw-mats inventoryContent px-4 py-2">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity inventoryContent px-4 py-2">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure inventoryContent px-4 py-2">${item.unit}</td>
        <td  class="px-4 py-2">${item.total}</td>
      </tr>
    `;
  });
}

updateBtn.addEventListener("click", function () {
  const inventorycontent = document.querySelectorAll(".inventoryContent");

  inventorycontent.forEach((contentTable) => {
    contentTable.contentEditable = "true";
    contentTable.classList.add("outline-red-600", "outline-1");
  });

  savebtn?.classList.remove("hidden"); // Ensure savebtn exists before modifying
});

function subscribeToRealTimeOrders() {
  supabase
    .channel("inventory-channel") // Create a real-time channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "inventory_table" },
      (payload) => {
        console.log("Order Change Detected:", payload);
        renderOngoingOrders(); // Refresh the table on changes
      }
    )
    .subscribe();
}

document.addEventListener("DOMContentLoaded", function () {
  function updateTotal() {
    const quantity = parseFloat(pcs.value) || 0;
    const price = parseFloat(prices.value) || 0;
    const total = (quantity * price).toFixed(2);
    totalDisplay.textContent = total;
  }

  rendercreatedMixtures();
  renderOngoingOrders(); // Load inventory on page load
  subscribeToRealTimeOrders(); // Enable real-time updates

  pcs.addEventListener("input", updateTotal);
  prices.addEventListener("input", updateTotal);
});
