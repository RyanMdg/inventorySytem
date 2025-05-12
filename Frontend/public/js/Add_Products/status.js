"use strict";
import supabase from "../../Backend2/config/SupabaseClient.js";

const cancel = document.getElementById("cancelTable");
const complete = document.getElementById("completedTable");

//*====FETCHING CANCEL ORDERS================
async function fetchCalcelOrders(startDate = null, endDate = null) {
  try {
    //* Get logged-in user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      throw new Error(authError?.message || "User not logged in");
    }

    const userId = userData.user.id;

    //* Get user's branch_id
    const { data: userBranch, error: userError } = await supabase
      .from("users_table")
      .select("branch_id")
      .eq("id", userId)
      .single();

    if (userError) throw new Error(userError.message);

    const branchId = userBranch.branch_id;

    let query = supabase
      .from("pos_orders_table")
      .select("id,product_price,payment_method,order_date,status,product_name")
      .eq("branch_id", branchId)
      .eq("status", "cancelled")
      .order("order_date", { ascending: false });

    //* Apply date filtering if provided
    if (startDate) query = query.gte("order_date", startDate);
    if (endDate) query = query.lte("order_date", endDate);

    //* Fetch all cancel orders for this branch
    const { data: orders, error: ordersError } = await query;

    if (ordersError) throw new Error(ordersError.message);

    cancel.innerHTML = "";

    orders.forEach((item) => {
      const formattedDate = new Date(item.order_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      cancel.innerHTML += `
        <tr class="border-b border-gray-300">
          <td contentEditable="false"  class="raw-mats inventoryContent px-4 py-4">${item.id}</td>
          <td contentEditable="false"  class="exp-date inventoryContent px-4 py-4">${item.product_name}</td>
          <td contentEditable="false"  class="quantity inventoryContent px-4 py-4">₱${item.product_price}</td>
          <td contentEditable="false"  class="unimeasure inventoryContent px-4 py-4"><span class="bg-[#F9C1C2] py-1 px-6 rounded-md  border border-red-600">${item.payment_method}</span> </td>
          <td contentEditable="false" id=""  class="price inventoryContent px-4 py-4">${formattedDate}</td>
          <td  class="px-4 py-4">${item.status}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return [];
  }
}

//*============FETCHING COMPLETED ORDERS=====================
async function fetchCompleteOrders(startDate = null, endDate = null) {
  try {
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

    let query = supabase
      .from("pos_orders_table")
      .select("id,product_price,payment_method,order_date,status,product_name")
      .eq("branch_id", branchId)
      .eq("status", "completed")
      .order("order_date", { ascending: false });

    //* Apply date filtering if provided
    if (startDate) query = query.gte("order_date", startDate);
    if (endDate) query = query.lte("order_date", endDate);

    //* Fetch all completed orders for this branch
    const { data: orders, error: ordersError } = await query;

    if (ordersError) throw new Error(ordersError.message);

    complete.innerHTML = "";

    orders.forEach((item) => {
      const formattedDate = new Date(item.order_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      complete.innerHTML += `
        <tr class="border-b border-gray-300">
          <td class="px-4 py-4">${item.id}</td>
          <td class="px-4 py-4">${item.product_name}</td>
          <td class="px-4 py-4">₱${item.product_price}</td>
          <td class="px-4 py-4"><span class="bg-[#F9C1C2] py-1 px-6 rounded-md border border-red-600">${item.payment_method}</span></td>
          <td class="px-4 py-4">${formattedDate}</td>
          <td class="px-4 py-4">${item.status}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
  }
}

//*=========filterbtn for complete orders================
document.getElementById("filterBtn").addEventListener("click", function () {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  fetchCompleteOrders(startDate, endDate);
});

//*==============filterbtn for cancel orders==============
document
  .getElementById("cancelfilterBtn")
  .addEventListener("click", function () {
    const startDate = document.getElementById("cancelstartDate").value;
    const endDate = document.getElementById("cancelendDate").value;
    fetchCalcelOrders(startDate, endDate);
  });

function subscribeToRealTimeOrders() {
  const channel = supabase.channel("status-channel");

  channel.on(
    "postgres_changes",
    {
      event: "*", // Listen to all CRUD operations
      schema: "public",
      table: "pos_orders_table",
    },
    (payload) => {
      // console.log("pos_orders_table Change Detected:", payload);

      // Check if status is cancelled
      if (payload.new?.status === "cancelled") {
      //   console.log("Cancelled Order Detected:", payload);
        fetchCalcelOrders(); // Refresh cancelled orders table
      }

      // Check if status is completed
      if (payload.new?.status === "completed") {
        // console.log("Completed Order Detected:", payload);
        fetchCompleteOrders(); // Refresh completed orders table
      }
    }
  );

  // Subscribe to the channel
  channel.subscribe();
}

document.addEventListener("DOMContentLoaded", function () {
  fetchCalcelOrders();
  fetchCompleteOrders();
  subscribeToRealTimeOrders();
});
