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
  totalIncomeContainer.innerHTML = ` <img
      src="/Frontend/public/images/Iphone-spinner-2.gif"
      alt="Total Icon"
      style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px;"
    ></img>`;

  const now = new Date();
  let fromDate;

  if (filter === "today") {
    fromDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  } else if (filter === "week") {
    const day = now.getDay();
    fromDate = new Date(now.setDate(now.getDate() - day)).toISOString();
  } else if (filter === "month") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  const { data, error } = await supabase
    .from("reciepts_summary_table")
    .select("*")
    .eq("branch_id", branchId)
    .eq("status", "Completed")
    .gte("created_at", fromDate);

  if (error) {
    console.error("Error fetching receipts:", error.message);
    totalIncomeContainer.textContent = "₱0.00";
    return;
  }

  const total = data.reduce((sum, row) => sum + (row.total || 0), 0);

  totalIncomeContainer.textContent = `₱${total.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
