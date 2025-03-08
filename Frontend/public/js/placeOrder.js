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
    console.error("ERROR FETCHING BRANCH ID:", userError?.message);
    alert("Could Not Retrieve branch details");
    return;
  }

  const branchId = userData.branch_id;

  // Loop through orders using forEach
  orders.forEach(async (ord) => {
    try {
      // Fetch product ID from products_table
      const name = ord.placeOrder_Name; // Ensure name is dynamic
      const { data: tableData, error: tableError } = await supabase
        .from("products_table")
        .select("id")
        .eq("name", name)
        .single();

      if (tableError || !tableData) {
        console.error("ERROR FETCHING PRODUCT ID:", tableError?.message);
        alert(`Could Not Retrieve product details for ${ord.placeOrder_Name}`);
        return; // Stop execution for this order
      }

      const Productid = tableData.id;
      console.log("Product ID:", Productid);

      // Insert order into pos_orders_table
      const { data: productData, error: productError } = await supabase
        .from("pos_orders_table")
        .insert([
          {
            branch_id: branchId,
            order_id: ord.orderid,
            quantity: ord.placeOrder_Qty,
            product_name: ord.placeOrder_Name,
            product_price: ord.placeOrder_Tot,
            status: "OnGoing",
            total: localStorage.getItem("grantotal"),
            product_id: Productid,
          },
        ])
        .select("id")
        .single();

      if (productError) {
        console.error("Error adding product:", productError.message);
        alert(`Failed to add order ${ord.orderid}.`);
        return;
      }

      alert(`Order "${ord.orderid}" was successful!`);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert(`An error occurred while processing order ${ord.orderid}.`);
    }

    console.log(document.getElementById("totalPrice").textContent);
  });
});
