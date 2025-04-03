"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

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
const createdTotal = document.querySelector(".createdTotal");
const updateBtn = document.querySelector(".updatebtn");
const createbtn = document.querySelector(".createBtn");
const addToStack = document.querySelector(".addbtn");
const createdMixtures = document.getElementById("created_mixtures");
const createdLeftover = document.getElementById("leftover_mixtures");
const notifContainer = document.getElementById("notificationcontainer");

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
  renderStocks(); // Refresh table immediately

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

//*ADDED MIXTURES FORM
async function renderaddedmixtures() {
  const finalSum = document.getElementById("sum");
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

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats,quantity,unit,total")
    .eq("branch_id", branchId)
    .eq("status", "Added_Mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  CreateinventoryData.innerHTML = "";
  let sum = 0;
  // Clear previous table data

  data.forEach((item) => {
    sum += item.total;
    CreateinventoryData.innerHTML += `
      <tr class="border-b border-b-neutral-700">
        <td contentEditable="false"  class="raw-mats inventoryContent px-4 text-center py-4">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity inventoryContent px-4 text-center py-4">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure font-bold inventoryContent text-center px-4 py-2">${item.unit}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>
      </tr>
     
    `;
  });
  finalSum.textContent = `₱${sum}`;
}

//*ADDED CREATED_MIXTURES FORM
async function renderCreadtedMixtures() {
  const finalSum = document.getElementById("sum");
  const cretedmixturesum = document.getElementById("createdmixture_sum");
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

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats,quantity,unit,total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  createdMixtures.innerHTML = "";
  let createdsum = 0;
  // Clear previous table data

  data.forEach((item) => {
    createdsum += item.total;
    createdMixtures.innerHTML += `
      <tr class="border-b border-b-neutral-700">
        <td contentEditable="false"  class="raw-mats text-center inventoryContent px-4 py-4">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity text-center inventoryContent px-4 py-4">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure text-center font-bold inventoryContent px-4  py-2">${item.unit}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>
      </tr>
     
    `;
  });
  cretedmixturesum.textContent = `₱${createdsum}`;
}

//*ADDED LEFTOVER_MIXTURES FORM
async function renderleftOver() {
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

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats,quantity,unit,total")
    .eq("branch_id", branchId)
    .eq("status", "Leftover_Mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  createdLeftover.innerHTML = "";
  // Clear previous table data

  data.forEach((item) => {
    createdLeftover.innerHTML += `
      <tr class="border-b border-b-neutral-700">
        <td contentEditable="false"  class="raw-mats text-center inventoryContent px-4 py-4">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity text-center inventoryContent px-4 py-4">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure text-center font-bold inventoryContent px-4  py-2">${item.unit}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>
      </tr>
     
    `;
  });
}

//*ADDED STOCKS/INVENTORY
async function renderStocks() {
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

  const { data, error } = await supabase
    .from("inventory_table")
    .select("total, quantity, unit, raw_mats, prices, exp_date")
    .eq("branch_id", branchId);

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  inventoryData.innerHTML = "";
  notifContainer.innerHTML = ""; // Clear previous table data

  data.forEach((item) => {
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationDropdown = document.getElementById(
      "notificationDropdown"
    );

    notificationBtn.addEventListener("click", () => {
      notificationDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (
        !notificationBtn.contains(event.target) &&
        !notificationDropdown.contains(event.target)
      ) {
        notificationDropdown.classList.add("hidden");
      }
    });
    const quantity = Number(item.quantity);

    if (quantity < 3) {
      notifContainer.innerHTML += `
     <li class="p-3 border-b hover:bg-gray-100 cursor-pointer">
                            <p class="text-sm text-gray-700">${item.raw_mats} is low on stock! Only ${quantity} left. </p>
                            <span class="text-xs text-gray-500">2 mins ago</span>
                        </li>
    `;
    }

    const formattedDate = new Date(item.exp_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    inventoryData.innerHTML += `
       <tr class="border-b border-b-neutral-700">
          <td contentEditable="false"  class="raw-mats text-center inventoryContent px-4 py-4">${item.raw_mats}</td>
          <td contentEditable="false"  class="exp-date font-bold text-center inventoryContent px-4 py-4">${formattedDate}</td>
          <td contentEditable="false"  class="quantity  text-center text-[1rem] font-bold inventoryContent px-4 py-4">${item.quantity}</td>
          <td contentEditable="false"  class="unimeasure text-center  inventoryContent px-4 py-4"><span >${item.unit}</span> </td>
          
          <td  class="px-4 text-center py-4">₱${item.prices}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>

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
  const channel = supabase.channel("inventory-channel"); // Create a real-time channel

  // Listen for changes in inventory_table
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "inventory_table",
    },
    (payload) => {
      console.log("Inventory Table Change Detected:", payload);
      renderStocks(); // Refresh the table on changes
    }
  );

  // Listen for changes in mixtures_table
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "mixtures_table",
    },
    (payload) => {
      // Refresh the table on changes
      console.log("Mixtures Table Change Detected:", payload);
      renderaddedmixtures();
      renderCreadtedMixtures();
      renderleftOver();
    }
  );

  // Subscribe to the channel
  channel.subscribe();
}

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

  createRaw.addEventListener("input", fetchPriceAndUpdateTotal);
  createPcs.addEventListener("input", fetchPriceAndUpdateTotal);
});
