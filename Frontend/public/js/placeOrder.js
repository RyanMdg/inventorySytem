"use strict";
import supabase from "../Backend2/config/SupabaseClient.js";
import orders from "./modal.js";

const btnPlaceOrder = document.querySelector(".placeOrderBtn");

btnPlaceOrder.addEventListener("click", async function () {
  const { data: user, error: autherror } = await supabase.auth.getUser();

  if (autherror || !user || !user.user) {
    console.error("User not authenticated", autherror?.message);
    alert("YOU MUST BE LOGGED IN TO PLACE ORDER");
    return;
  }

  const userId = user.user.id;

  // Fetch branch_id from users_table
  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user branch_id", userError?.message);
    alert("Error fetching user branch. Please try again.");
    return;
  }

  const branchId = userData.branch_id;
  const receiptNumber = `RCPT-${Date.now()}`; // Generate a unique receipt number

  const orderArray = Array.from(orders.values()); // Convert orders map to an array

  for (const order of orderArray) {
    const {
      placeOrder_Name,
      placeOrder_Qty,
      placeOrder_Tot,
      placeOrder_AddOns,
    } = order;

    const grandTotal = localStorage.getItem("grantotal");
    const paymentmethod = localStorage.getItem("paymentMethod");
    const pickupMethod = localStorage.getItem("pickupMethod");
    const { data, error } = await supabase.from("pos_orders_table").insert([
      {
        branch_id: branchId,
        receipt_number: receiptNumber, // Assign the same receipt number for all items
        product_name: placeOrder_Name,
        quantity: placeOrder_Qty,
        product_price: placeOrder_Tot,
        add_ons: placeOrder_AddOns,
        status: "ongoing",
        total: grandTotal,
        payment_method: paymentmethod,
        pickup_method: pickupMethod,
        order_date: new Date(), // Store the current date
      },
    ]);

    if (error) {
      console.error("Error inserting order:", error.message);
      alert("Error placing order. Please try again.");
      return;
    }
  }

  alert(`Order placed successfully! Receipt No: ${receiptNumber}`);

  // Clear the orders after inserting into the database

  localStorage.removeItem("receiptNumber");

  [
    ".recieptProdName",
    ".recieptQuantityName",
    ".recieptPriceName",
    ".recieptToppings",
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => element.remove());
  });
  orders.clear();
});
