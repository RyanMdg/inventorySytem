"strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const raw = document.getElementById("raw");
const pcs = document.getElementById("qty");
const unit = document.getElementById("unit");
const prices = document.getElementById("price");
const expdate = document.getElementById("expDate");
const totalDisplay = document.querySelector(".total p");
const addToStack = document.querySelector(".addbtn");

document.addEventListener("DOMContentLoaded", function () {
  function updateTotal() {
    const quantity = parseFloat(pcs.value) || 0;
    const price = parseFloat(prices.value) || 0;
    const total = (quantity * price).toFixed(2);
    totalDisplay.textContent = total;
  }

  pcs.addEventListener("input", updateTotal);
  prices.addEventListener("input", updateTotal);
});

addToStack.addEventListener("click", async function () {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to add a product.");
    return;
  }

  const userId = user.user.id; //* logged-in user's ID

  //* Step 4: Get User's Branch ID
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

  const { data: addStock, error: errorAddStock } = await supabase
    .from("inventory_table")
    .insert([
      {
        branch_id: branchId,
        raw_mats: raw.value,
        quantity: pcs.value,
        unit: unit.value,
        prices: prices.value,
        exp_date: expdate.value,
        total: prices.value * pcs.value,
      },
    ])
    .select("id")
    .single();

  if (errorAddStock) {
    console.error("Error adding stock:", errorAddStock?.message);
    alert("Failed to add the stock");
    return;
  }
  alert(`stock added successfully`);

  const { data, error } = await supabase
    .from("inventory_table")
    .select("total");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  let sum = 0;

  data.forEach((item, index) => {
    console.log(`Total ${index + 1}:`, item.total);
    sum += item.total;
  });

  console.log(sum);
  raw.value = "";
  pcs.value = "";
  unit.value = "";
  prices.value = "";
  totalDisplay.textContent = "0.00";
});
