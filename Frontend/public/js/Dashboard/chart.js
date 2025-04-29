"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

export async function fetchWeeklyGrossSales(branchId) {
  const { data, error } = await supabase
    .from("reciepts_summary_table")
    .select("created_at, total")
    .eq("branch_id", branchId)
    .eq("status", "Completed");

  if (error) {
    console.error("Error fetching sales data:", error.message);
    return [];
  }

  const dailyTotals = Array(7).fill(0);

  data.forEach((row) => {
    const dayIndex = new Date(row.created_at).getDay();
    dailyTotals[dayIndex] += row.total || 0;
  });

  return dailyTotals;
}

let ChartInstance = null;

export async function renderSalesChart() {
  const { branchId } = await getAuthUserAndBranch();
  const salesData = await fetchWeeklyGrossSales(branchId);

  const ctx = document.getElementById("salesChart").getContext("2d");

  if (ChartInstance) {
    ChartInstance.destroy();
  }
  ChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: "Gross Sales (₱)",
          data: salesData,
          backgroundColor: "rgb(182,2,5)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

renderSalesChart();
