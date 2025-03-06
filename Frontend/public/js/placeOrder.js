"strict";
import supabase from "../Backend2/config/SupabaseClient.js";
import orders from "./modal.js";

const btnPlaceOrder = document.querySelector(".placeOrderBtn");

btnPlaceOrder.addEventListener("click", function () {
  orders.clear();
  console.log(orders);
});
