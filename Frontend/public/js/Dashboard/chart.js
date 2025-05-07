"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

// Helper to get a unique key for the current week
function getCurrentWeekKey() {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${weekNumber}`;
}

export async function fetchWeeklyGrossSales(branchId) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("reciepts_summary_table")
    .select("created_at, total")
    .eq("branch_id", branchId)
    .eq("status", "Completed")
    .gte("created_at", startOfWeek.toISOString()); // Only current week

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
  const currentWeekKey = getCurrentWeekKey();
  const lastRenderedWeek = localStorage.getItem("lastRenderedWeek");

  if (lastRenderedWeek === currentWeekKey && ChartInstance) {
    console.log("Chart already rendered for this week.");
    return;
  }

  localStorage.setItem("lastRenderedWeek", currentWeekKey);

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

// Initial call
renderSalesChart();
