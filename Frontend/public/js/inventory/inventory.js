"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

import { renderStocks } from "./renders/renderStocks.js";
import { renderaddedmixtures } from "./renders/renderaddedmixtures.js";
import { renderCreadtedMixtures } from "./renders/renderCreadtedMixtures.js";
import { renderleftOver } from "./renders/renderleftOver.js";
import { subscribeToRealTimeOrders } from "./realtimeHandlers/subscribeToRealTimeOrders.js";

const raw = document.getElementById("raw");
const createRaw = document.getElementById("createRaw");
const pcs = document.getElementById("qty");
const createPcs = document.getElementById("createQty");
const unit = document.getElementById("unit");
const createUnit = document.getElementById("createUnit");
const prices = document.getElementById("price");
const expdate = document.getElementById("expDate");
const prchasedate = document.getElementById("prchasedate");
const totalDisplay = document.querySelector(".total p");
const createdtotal = document.querySelector(".createdTotal p");
const createdTotal = document.querySelector(".createdTotal");
const updateBtn = document.querySelector(".updatebtn");
const createbtn = document.querySelector(".createBtn");
const addToStack = document.querySelector(".addbtn");

let inventoryid = "";

//* ADD BUTTON TO ADD PRODUCTS TO STOCK CONTAINER
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

  const { data: inventory, error: inventoryerror } = await supabase
    .from("inventory_table")
    .select("raw_mats,status")
    .eq("branch_id", branchId);

  const isDubplicated = inventory.some(
    (item) => item.raw_mats === raw.value && item.status === "new"
  );

  if (isDubplicated) {
    const totalPrice = parseFloat(prices.value) * parseFloat(pcs.value);

    await supabase
      .from("inventory_table")
      .update({ status: "old" })
      .eq("raw_mats", raw.value)
      .eq("status", "new");

    const { data: addStock, error: errorAddStock } = await supabase
      .from("inventory_table")
      .insert([
        {
          branch_id: branchId,
          raw_mats: raw.value,
          quantity: pcs.value,
          unit: unit.value,
          prices: parseFloat(prices.value),
          exp_date: expdate.value,
          prchse_date: prchasedate.value,
          status: "new",
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
    inventoryid += addStock.id;

    renderStocks();

    // Clear ng inputs
    raw.value = "";
    pcs.value = "";
    unit.value = "";
    prices.value = "";
    expdate.value = "";
    totalDisplay.textContent = "0.00";
  } else {
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
          prchse_date: prchasedate.value,
          status: "new",
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
    inventoryid += addStock.id;

    renderStocks(); // Refresh table immediately

    raw.value = "";
    pcs.value = "";
    unit.value = "";
    prices.value = "";
    expdate.value = "";
    totalDisplay.textContent = "0.00";
  }
});

//*  ADD BUTTON TO LIST IN  CREATEDMIXTURE AS "ADDED_MIXTURE"
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
    .select("quantity, raw_mats,prices,total")
    .eq("branch_id", branchId)
    .eq("raw_mats", createRaw.value)
    .single();

  if (stockError || !stockData) {
    console.error("Error fetching stock:", stockError?.message);
    alert("Raw material not found in inventory.");
    return;
  }

  const updatedPrice = stockData.prices;
  const availableQty = stockData.quantity;
  const requiredQty = parseFloat(createPcs.value);

  // Validate stock availability
  if (requiredQty > availableQty) {
    alert("Not enough stock available for this mixture.");
    return;
  }

  // Calculate new stock after deduction
  const newTotal = requiredQty * updatedPrice;
  const newStock = availableQty - requiredQty;

  // Update inventory table to deduct stock
  const { error: updateError } = await supabase
    .from("inventory_table")
    .update({ quantity: newStock, total: stockData.total - newTotal })
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
        total: requiredQty * updatedPrice,
        status: "Added_Mixture",
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

  renderaddedmixtures();

  // Reset fields
  createRaw.value = "";
  createPcs.value = "";
  createUnit.value = "";
  createdtotal.textContent = "0.00";
});

document.addEventListener("DOMContentLoaded", function () {
  renderaddedmixtures();
  renderStocks(); // Load inventory on page load
  renderCreadtedMixtures();
  renderleftOver();
  subscribeToRealTimeOrders();
  async function fetchPriceAndUpdateTotal() {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      throw new Error(authError?.message || "User not logged in");
    }

    const userId = userData.user.id;

    const { data: userBranch, error: userError } = await supabase
      .from("users_table")
      .select("branch_id")
      .eq("id", userId)
      .single();

    if (userError) throw new Error(userError.message);

    const branchId = userBranch.branch_id;

    const rawMat = createRaw.value; // Get what the user types

    if (!rawMat) return; // If input is empty, exit

    const { data, error } = await supabase
      .from("inventory_table")
      .select("prices")
      .eq("raw_mats", rawMat)
      .eq("branch_id", branchId)
      .maybeSingle(); // Fetch the price of the typed raw material

    if (error) {
      console.error("Error fetching price:", error.message);
      return;
    }

    if (data && data.prices !== null) {
      mixtureTotal(data.prices); // Call function with fetched price
    } else {
      createdTotal.textContent = "0.00"; // If no price found, set to 0
    }
  }

  function updateTotal() {
    const quantity = parseFloat(pcs.value) || 0;
    const price = parseFloat(prices.value) || 0;
    const total = (quantity * price).toFixed(2);
    totalDisplay.textContent = total;
  }

  pcs.addEventListener("input", updateTotal);
  prices.addEventListener("input", updateTotal);

  function mixtureTotal(price) {
    const quantity = parseFloat(createPcs.value) || 0;
    const mixtureTotal = (quantity * price).toFixed(2);
    createdTotal.textContent = mixtureTotal;
  }

  // Enable real-time updates

  createRaw.addEventListener("change", fetchPriceAndUpdateTotal);
  createPcs.addEventListener("input", fetchPriceAndUpdateTotal);
});
