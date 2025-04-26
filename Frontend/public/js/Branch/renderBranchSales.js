"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

let currentBranchId = null;

export function setCurrentBranchId(id) {
  currentBranchId = id;
}

const totalIncomeContainer = document.getElementById(
  "GrossSaleFranchiseContainer"
);

document
  .getElementById("GrossSalefranchiseFilter")
  .addEventListener("change", (e) => {
    if (currentBranchId) {
      FranchiseetotalIncome(e.target.value, currentBranchId);
    }
  });

export async function FranchiseetotalIncome(filter = "today", branchId) {
  totalIncomeContainer.innerHTML = `<img
        src="/Frontend/public/images/Iphone-spinner-2.gif"
        alt="Total Icon"
        style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px;"
      >`;

  const now = new Date();
  let fromDate;
  let toDate;
  let yesterdayStart, yesterdayEnd;

  if (filter === "today") {
    fromDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    toDate = new Date().toISOString();

    // Yesterday's range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
  } else if (filter === "week") {
    const day = now.getDay();
    fromDate = new Date(now.setDate(now.getDate() - day)).toISOString();
  } else if (filter === "month") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  // Fetch today's income
  const { data: todayData, error: todayError } = await supabase
    .from("reciepts_summary_table")
    .select("*")
    .eq("branch_id", branchId)
    .eq("status", "Completed")
    .gte("created_at", fromDate)
    .lte("created_at", toDate);

  if (todayError) {
    console.error("Error fetching today receipts:", todayError.message);
    totalIncomeContainer.textContent = "₱0.00";
    return;
  }

  const todayTotal = todayData.reduce((sum, row) => sum + (row.total || 0), 0);

  // Fetch yesterday's income (only if filter is "today")
  let yesterdayTotal = 0;
  if (filter === "today") {
    const { data: yesterdayData, error: yesterdayError } = await supabase
      .from("reciepts_summary_table")
      .select("*")
      .eq("branch_id", branchId)
      .eq("status", "Completed")
      .gte("created_at", yesterdayStart)
      .lte("created_at", yesterdayEnd);

    if (yesterdayError) {
      console.error(
        "Error fetching yesterday receipts:",
        yesterdayError.message
      );
    } else {
      yesterdayTotal = yesterdayData.reduce(
        (sum, row) => sum + (row.total || 0),
        0
      );
    }
  }

  // Calculate percentage change
  let percentageChange = 0;
  if (filter === "today" && yesterdayTotal !== 0) {
    percentageChange =
      ((todayTotal - yesterdayTotal) / Math.abs(yesterdayTotal)) * 100;
  }

  let percentHTML = "";
  if (filter === "today") {
    if (percentageChange > 0) {
      percentHTML = `<span class="text-green-600 text-sm ml-2">▲ ${percentageChange.toFixed(
        2
      )}%</span>`;
    } else if (percentageChange < 0) {
      percentHTML = `<span class="text-red-600 text-sm ml-2">▼ ${Math.abs(
        percentageChange
      ).toFixed(2)}%</span>`;
    } else {
      percentHTML = `<span class="text-gray-500 text-sm ml-2">(No change)</span>`;
    }
  }

  totalIncomeContainer.innerHTML = `
      <p class="text-2xl flex font-bold">
        ₱${todayTotal.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
       <span class = "flex flex-col items-center ps-32">
       ${percentHTML}
       <span class="text-[#9b9b9bb0] text-[.7rem] ml-2">(vs yesterday ${yesterdayTotal})</span>
       </span> 
      </p>
    `;
}
