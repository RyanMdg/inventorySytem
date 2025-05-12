import supabase from "../../Backend2/config/SupabaseClient.js";

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function getStatusBadge(status) {
  if (status === "completed") {
    return '<span class="px-3 py-1 rounded font-semibold text-xs bg-cyan-100 text-gray-800">Completed</span>';
  } else if (status === "cancelled") {
    return '<span class="px-3 py-1 rounded font-semibold text-xs bg-red-100 text-gray-800">Cancelled</span>';
  } else if (status === "on going" || status === "ongoing") {
    return '<span class="px-3 py-1 rounded font-semibold text-xs bg-yellow-100 text-gray-800">On Going</span>';
  }
  return `<span class="px-3 py-1 rounded font-semibold text-xs bg-gray-200 text-gray-800">${status}</span>`;
}

export async function renderRecentOrders() {
  const tableBody = document.getElementById("recent-orders-table");
  const sortSelect = document.getElementById("recentOrdersSort");
  if (!tableBody) return;

  // Fetch all orders (no limit)
  const { data: orders, error } = await supabase
    .from("pos_orders_table")
    .select("receipt_number, order_date, status, product_price, product_name")
    .order("order_date", { ascending: false });

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-red-500">Failed to load orders.</td></tr>`;
    return;
  }

  // Group by receipt_number, sum product_price, join product_name, get latest order_date and status
  const grouped = {};
  orders.forEach(order => {
    if (!grouped[order.receipt_number]) {
      grouped[order.receipt_number] = {
        receipt_number: order.receipt_number,
        order_date: order.order_date,
        status: order.status,
        product_price: 0,
        product_names: new Set()
      };
    }
    grouped[order.receipt_number].product_price += order.product_price;
    grouped[order.receipt_number].product_names.add(order.product_name);
    // Use the latest order_date and status if there are multiple
    if (new Date(order.order_date) > new Date(grouped[order.receipt_number].order_date)) {
      grouped[order.receipt_number].order_date = order.order_date;
      grouped[order.receipt_number].status = order.status;
    }
  });

  let uniqueOrders = Object.values(grouped).map(order => ({
    ...order,
    product_names: Array.from(order.product_names).join(", ")
  }));

  function renderTable(data) {
    tableBody.innerHTML = data.map(order => `
      <tr class="border-b">
        <td class="py-2 px-2 text-sm">${order.receipt_number}</td>
        <td class="py-2 px-2 text-sm">${formatDate(order.order_date)}</td>
        <td class="py-2 px-2 text-sm">${order.product_names}</td>
        <td class="py-2 px-2 text-sm">₱${order.product_price.toLocaleString()}</td>
        <td class="py-2 px-2 text-sm">${getStatusBadge(order.status)}</td>
      </tr>
    `).join("");
  }

  // Initial render (show all)
  renderTable(uniqueOrders);

  // Sorting/filtering by status only
  if (sortSelect) {
    sortSelect.onchange = () => {
      let filtered = [];
      if (sortSelect.value === "status_cancelled") {
        filtered = uniqueOrders.filter(o => o.status === "cancelled");
      } else if (sortSelect.value === "status_completed") {
        filtered = uniqueOrders.filter(o => o.status === "completed");
      } else if (sortSelect.value === "status_ongoing") {
        filtered = uniqueOrders.filter(o => o.status === "on going" || o.status === "ongoing");
      }
      renderTable(filtered);
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecentOrders();
}); 