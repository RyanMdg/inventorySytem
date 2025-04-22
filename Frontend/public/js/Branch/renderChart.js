"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

export async function fetchWeeklyFranchise_GS(branchId) {
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

export async function renderFranchiseSalesChart(branchId) {
  const salesData = await fetchWeeklyFranchise_GS(branchId);

  const ctx = document.getElementById("franchiseSaleChart").getContext("2d");
  new Chart(ctx, {
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
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

renderFranchiseSalesChart();
