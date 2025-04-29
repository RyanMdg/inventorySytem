"use strict";
import supabase from "../../Backend2/config/SupabaseClient.js";
import orders from "../modal.js";

const btnPlaceOrder = document.querySelector(".placeOrderBtn");
const totalreciept = document.querySelector(".grandtotal");
const reciept_num = document.getElementById("reciept_num");
const reciept_container = document.getElementById("reciept_container");

function closeModalOnOutsideClick(event) {
  if (!reciept_container.contains(event.target)) {
    reciept_container.classList.add("opacity-0");
    // Remove the event listener after closing the modal to avoid memory leaks
    document.removeEventListener("click", closeModalOnOutsideClick);
  }
}

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
  const receiptNumber = `RCPT-${Date.now()}`; //* unique receipt number

  const orderArray = Array.from(orders.values()); //* orders map to array

  if (orderArray.length === 0) {
    alert("No orders found!");
    return;
  }

  //*loop in array
  for (const order of orderArray) {
    const {
      placeOrder_Name,
      placeOrder_Qty,
      placeOrder_Tot,
      placeOrder_AddOns,
    } = order;

    console.log(
      order.placeOrder_Name,
      order.placeOrder_AddOns,
      order.placeOrder_Qty,
      order.placeOrder_Tot
    );

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
  const grandTotals = localStorage.getItem("grantotal");
  const paymentmethods = localStorage.getItem("paymentMethod");

  const parsedTotal = parseFloat(grandTotals);

  const { recieptsum, errorrecieptsum } = await supabase
    .from("reciepts_summary_table")
    .insert([
      {
        branch_id: branchId,
        receipt_number: receiptNumber,
        total: parsedTotal,
        payment_method: paymentmethods,
        status: "ongoing",
      },
    ]);

  if (errorrecieptsum) {
    console.error("Error inserting order:", errorrecieptsum.message);
    alert("Error placing order. Please try again.");
    return;
  }

  // Display the receipt number and total amount in the receipt container
  const grandTotalReciept = document.getElementById("grandTotalReciept");

  reciept_container.classList.remove("opacity-0");

  document.addEventListener("click", closeModalOnOutsideClick);

  reciept_num.textContent = `${receiptNumber}`;
  grandTotalReciept.textContent = ` ${grandTotals}`;
  console.log(receiptNumber);

  // Clear the orders after inserting into database
  orders.clear();

  localStorage.removeItem("receiptNumber");
  localStorage.setItem("grantotal", 0);

  const grandTotal = localStorage.getItem("grantotal");
  document.querySelector(".grandTotal").textContent = grandTotal;
  console.log(grandTotal);
  [
    ".recieptProdName",
    ".recieptQuantityName",
    ".recieptPriceName",
    ".recieptToppings",
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => element.remove());
  });
});
