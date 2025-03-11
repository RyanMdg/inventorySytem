"use strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const raw = document.getElementById("raw");
const pcs = document.getElementById("qty");
const unit = document.getElementById("unit");
const prices = document.getElementById("price");
const expdate = document.getElementById("expDate");
const totalDisplay = document.querySelector(".total p");
const inventoryData = document.getElementById("inventory-data");
const addToStack = document.querySelector(".addbtn");

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

  alert(`Stock added successfully`);
  renderOngoingOrders(); // Refresh table immediately

  raw.value = "";
  pcs.value = "";
  unit.value = "";
  prices.value = "";
  expdate.value = "";
  totalDisplay.textContent = "0.00";
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
        <td class="px-4 py-2">${item.raw_mats}</td>
        <td class="px-4 py-2">${item.exp_date}</td>
        <td class="px-4 py-2">${item.quantity}</td>
        <td class="px-4 py-2">${item.unit}</td>
        <td class="px-4 py-2">${item.prices}</td>
        <td class="px-4 py-2">${item.total}</td>
      </tr>
    `;
  });
}

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

  renderOngoingOrders(); // Load inventory on page load
  subscribeToRealTimeOrders(); // Enable real-time updates

  pcs.addEventListener("input", updateTotal);
  prices.addEventListener("input", updateTotal);
});
