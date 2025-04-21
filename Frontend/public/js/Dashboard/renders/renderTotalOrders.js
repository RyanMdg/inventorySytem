"strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
const totalOrderContainer = document.getElementById("totalOrderContainer");

document.getElementById("totalOrderFilter").addEventListener("change", (e) => {
  totalOrder(e.target.value);
});

export async function totalOrder(filter = "today") {
  const { branchId } = await getAuthUserAndBranch();
  totalOrderContainer.innerHTML = ` <img
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

  const { count, countError } = await supabase
    .from("reciepts_summary_table")
    .select("total", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .eq("status", "Completed")
    .gte("created_at", fromDate);

  if (countError) {
    console.error("Error fetching receipts:", countError.message);
    totalOrderContainer.textContent = "₱0.00";
    return;
  }

  totalOrderContainer.textContent = `${count}`;
}

totalOrder();
