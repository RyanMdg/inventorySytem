"use strict";

import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import supabase from "../../Backend2/config/SupabaseClient.js";

const cretedmixturesum = document.getElementById("createdmixture_sum");

export async function calculated(receiptNum) {
  const { branchId } = await getAuthUserAndBranch();

  const { data: receipt, error: receiptError } = await supabase
    .from("pos_orders_table")
    .select("receipt_number, quantity, is_deducted")
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
    .from("mixtures_summary_table")
    .select("total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture")
    .single();

  if (mixtureError) {
    console.error("Error fetching mixtures:", mixtureError.message);
    return;
  }

  const totalBalls = receipt.reduce((acc, item) => {
    if (item.quantity) {
      const numValue = parseFloat(item.quantity.slice(0, -1));
      return acc + numValue;
    }
    return acc;
  }, 0);

  console.log(mixture.total);

  console.log(typeof totalBalls);

  const remainingRaw = sumUpRaw(mixture.total, totalBalls);
  const raw = remainingRaw.toFixed(1);

  console.log("Total Balls Ordered:", totalBalls);
  console.log("Remaining Raw Materials After:", raw);

  const { error: updateError } = await supabase
    .from("pos_orders_table")
    .update({ is_deducted: true })
    .eq("receipt_number", receiptNum);

  if (updateError) {
    console.error("Failed to update is_deducted:", updateError.message);
  }

  const { data, error } = await supabase
    .from("mixtures_summary_table")
    .update({ total: raw })
    .eq("branch_id", branchId);

  if (error) {
    console.error("Failed to update is_deducted:", error.message);
  }
}

const sumUpRaw = (expensesRaw, quantity) => {
  const pricePerBall = 3.285;
  return expensesRaw - pricePerBall * quantity;
};
