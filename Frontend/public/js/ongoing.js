"use strict";
import supabase from "../Backend2/config/SupabaseClient.js";

// Function to fetch ongoing orders for the logged-in user's branch
async function fetchOngoingOrders() {
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

    //* Fetch all ongoing orders for this branch
    const { data: orders, error: ordersError } = await supabase
      .from("pos_orders_table")
      .select("*")
      .eq("branch_id", branchId) // Filter by branch
      .eq("status", "ongoing") // Only ongoing orders
      .order("order_date", { ascending: false });

    if (ordersError) throw new Error(ordersError.message);

    //* Group orders by receipt number
    return groupOrdersByReceipt(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return [];
  }
}

// Helper function to group orders by receipt number
function groupOrdersByReceipt(orders) {
  return orders.reduce((acc, order) => {
    if (!acc[order.receipt_number]) {
      acc[order.receipt_number] = [];
    }
    acc[order.receipt_number].push(order);
    return acc;
  }, {});
}

// Function to render orders inside the container
async function renderOngoingOrders() {
  const ordersContainer = document.getElementById("orders-container");
  ordersContainer.innerHTML = "<p>Loading orders...</p>";

  const groupedOrders = await fetchOngoingOrders();

  if (Object.keys(groupedOrders).length === 0) {
    ordersContainer.innerHTML = "<p>No ongoing orders found.</p>";
    return;
  }

  ordersContainer.innerHTML = ""; // Clear previous content

  Object.entries(groupedOrders).forEach(([receipt, orders]) => {
    const totalAmount = orders.reduce((sum, o) => sum + o.product_price, 0);

    const orderCard = document.createElement("div");
    orderCard.classList.add("order-card");

    orderCard.innerHTML = `
    <div class=" bg-white basis-1/3  shadow drop-shadow-2xl  px-8 py-5 rounded-2xl text-[#302D3D]">

    <div class=" flex gap-10">
    <div class=" flex flex-col">
      <h3 class=" font-semibold">${receipt}</h3>
      <p>Date: ${new Date(orders[0].order_date).toLocaleString()}</p>
    </div>
     <div class=" flex gap-1  flex-col" >
     <h1 class="font-semibold text-[#B60205]">${orders[0].pickup_method}</h1>
      <h1 class="font-semibold  text-[#B60205]">${orders[0].payment_method}</h1>
    </div>
    </div>
   
      <table class="  mt-4">
  <thead>
    <tr class="text-1xl  ">
      <th class="px-4 py-2">Items</th>
      <th class="px-4 py-2">Qty</th>
      <th class=" px-4 py-2">Price</th>
    </tr>
  </thead>
  <tbody>
    ${orders
      .map(
        (order) => `
      <tr class="">
        <td class=" px-4 py-2">${order.product_name}</td>
        <td class=" px-4 py-2">${order.quantity}</td>
        <td class=" px-4 py-2">₱${order.product_price}</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
</table>

       <hr class=" mt-5 mb-3"/>
       <div class=" flex justify-between mx-5 font-semibold text-[1rem] mb-3">
       <span>Total:</span> <h4> ₱${totalAmount}</h4>
       </div>
      
     <div class=" flex justify-between mx-4 "> 
     <button class="complete-btn cursor-pointer bg-[#B60205] text-white rounded-md px-5 py-2" data-receipt="${receipt}">Completed</button>
      <button class="cancel-btn cursor-pointer bg-[#B60205] text-white rounded-md px-5 py-2" data-receipt="${receipt}">Cancel</button>
     </div>
      
    </div>
     
    `;

    ordersContainer.appendChild(orderCard);
  });

  attachButtonEventListeners();
}

// Function to handle order completion or cancellation
function attachButtonEventListeners() {
  document.querySelectorAll(".complete-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const receiptNumber = event.target.dataset.receipt;
      await updateOrderStatus(receiptNumber, "completed");
    });
  });

  document.querySelectorAll(".cancel-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const receiptNumber = event.target.dataset.receipt;
      await updateOrderStatus(receiptNumber, "cancelled");
    });
  });
}

// Function to update order status in Supabase
async function updateOrderStatus(receiptNumber, newStatus) {
  try {
    const { error } = await supabase
      .from("pos_orders_table")
      .update({ status: newStatus })
      .eq("receipt_number", receiptNumber);

    if (error) throw new Error(error.message);

    alert(`Order ${receiptNumber} marked as ${newStatus}.`);
    renderOngoingOrders(); // Refresh orders list
  } catch (error) {
    console.error(`Error updating order ${receiptNumber}:`, error.message);
  }
}

// Ensure orders load on page load
function subscribeToRealTimeOrders() {
  supabase
    .channel("orders-channel") // Create a real-time channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pos_orders_table" },
      (payload) => {
        console.log("Order Change Detected:", payload);
        renderOngoingOrders(); // Refresh the orders automatically
      }
    )
    .subscribe();
}

// **Load orders on page load**
document.addEventListener("DOMContentLoaded", () => {
  renderOngoingOrders();
  subscribeToRealTimeOrders(); // Start real-time updates
});
