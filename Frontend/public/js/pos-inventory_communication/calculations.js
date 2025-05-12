"use strict";

import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import supabase from "../../Backend2/config/SupabaseClient.js";
import { calculateDynamicCostPerBall , calculateTotalBatchCost } from "./takoyaki-calculation.js";

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
    .from("mixtures_table")
    .select("total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture")
    

  if (mixtureError) {
    console.error("Error fetching mixtures:", mixtureError.message);
    return;
  }

  const totalCost = await calculateTotalBatchCost();
  console.log("Total Batch Cost:", totalCost);

  const totalBalls = receipt.reduce((acc, item) => {
    if (item.quantity) {
      const numValue = parseFloat(item.quantity.slice(0, -1));
      return acc + numValue;
    }
    return acc;
  }, 0);

 

  console.log("this is the totalBalls", totalBalls);

  const remainingRaw = await sumUpRaw(totalCost, totalBalls);
  const raw = remainingRaw.toFixed(2);

  console.log("Total Balls Ordered:", totalBalls);
  console.log("Remaining Raw :", raw);

  const { error: updateError } = await supabase
    .from("pos_orders_table")
    .update({ is_deducted: true })
    .eq("receipt_number", receiptNum);

  if (updateError) {
    console.error("Failed to update is_deducted:", updateError.message);
  }
}

const sumUpRaw = async (expensesRaw, quantity) => {
  const pricePerBall = await calculateDynamicCostPerBall();
  const costPerBatch = pricePerBall * quantity;
  return expensesRaw - costPerBatch;
};

