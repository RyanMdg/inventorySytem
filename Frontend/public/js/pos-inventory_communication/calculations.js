"use strict";

import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import supabase from "../../Backend2/config/SupabaseClient.js";

const cretedmixturesum = document.getElementById("createdmixture_sum");

export async function calculated(receiptNum) {
  const { branchId } = await getAuthUserAndBranch();

  const { data: receipt, error: receiptError } = await supabase
    .from("pos_orders_table")
    .select("receipt_number, quantity, total, is_deducted")
    .eq("branch_id", branchId)
    .eq("status", "completed")
    .eq("receipt_number", receiptNum);

  if (receiptError) {
    console.error("Error fetching receipts:", receiptError.message);
    return;
  }

  if (!receipt || receipt.length === 0) {
    console.warn("No matching receipt found.");
    return;
  }

  if (receipt[0].is_deducted) {
    console.warn("This receipt has already been deducted.");
    return;
  }

  // ✅ Fetch created mixture totals (expenses raw)
  const { data: mixture, error: mixtureError } = await supabase
    .from("mixtures_table")
    .select("total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (mixtureError) {
    console.error("Error fetching mixtures:", mixtureError.message);
    return;
  }

  const totalExpensesRaw = parseFloat(localStorage.getItem("rawsum") || "0");

  const totalBalls = receipt.reduce((acc, item) => {
    if (item.quantity) {
      const numValue = parseFloat(item.quantity.slice(0, -1));
      return acc + numValue;
    }
    return acc;
  }, 0);

  const remainingRaw = sumUpRaw(totalExpensesRaw, totalBalls);

  console.log("Total Raw Materials Before:", totalExpensesRaw.toFixed(1));
  console.log("Total Balls Ordered:", totalBalls);
  console.log("Remaining Raw Materials After:", remainingRaw.toFixed(1));

  localStorage.setItem("rawsum", remainingRaw.toFixed(2));
  cretedmixturesum.textContent = `₱${remainingRaw.toFixed(2)}`;

  const { error: updateError } = await supabase
    .from("pos_orders_table")
    .update({ is_deducted: true })
    .eq("receipt_number", receiptNum);

  if (updateError) {
    console.error("Failed to update is_deducted:", updateError.message);
  }
}

const sumUpRaw = (expensesRaw, quantity) => {
  const pricePerBall = 3.285;
  return expensesRaw - pricePerBall * quantity;
};
