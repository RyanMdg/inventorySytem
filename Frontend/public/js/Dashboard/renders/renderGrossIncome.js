"strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
const totalGrossIncomeContainer = document.getElementById(
  "totalGrossIncomeContainer"
);

document.getElementById("GrossincomeFilter").addEventListener("change", (e) => {
  totalGrossIncome(e.target.value);
});

export async function totalGrossIncome(filter = "today") {
  const { branchId } = await getAuthUserAndBranch();
  totalGrossIncomeContainer.innerHTML = ` <img
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

  const { data: net, error: neterror } = await supabase
    .from("pos_orders_table")
    .select("net_income")
    .eq("branch_id", branchId)
    .eq("status", "completed")
    .gte("created_at", fromDate);

  if (neterror) {
    console.error("Error fetching receipts:", neterror.message);
    totalGrossIncomeContainer.textContent = "₱0.00";
    return;
  }

  const total = net.reduce((sum, row) => sum + (row.net_income || 0), 0);

  totalGrossIncomeContainer.textContent = `₱${total.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

totalGrossIncome();
