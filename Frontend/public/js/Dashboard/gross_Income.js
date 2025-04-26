"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

export async function GrossIncome(receipts) {
  const { branchId } = await getAuthUserAndBranch();

  const { data: receipt, error: receiptError } = await supabase
    .from("pos_orders_table")
    .select("receipt_number,id, quantity, is_deducted,product_price")
    .eq("branch_id", branchId)
    .eq("status", "completed")
    .eq("receipt_number", receipts);

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

  const totalBalls = receipt.reduce((acc, item) => {
    if (item.quantity) {
      const numValue = parseFloat(item.quantity.slice(0, -1));
      return acc + numValue;
    }
    return acc;
  }, 0);

  const quantityPrice = localStorage.getItem("quantityPrice");
  const menuPrice = Number(quantityPrice);

  for (const item of receipt) {
    const numberOnly = item.quantity;
    const totalBalls = parseInt(numberOnly.replace("s", ""));
    const net = netCalculator(totalBalls, item.product_price);

    console.log(
      `Net income: ₱${net.toFixed(
        2
      )} (Total Balls: ${totalBalls}, Menu Price: ₱${item.product_price})`
    );

    const { data: netIncome, error: netError } = await supabase
      .from("pos_orders_table")
      .update({ net_income: net })
      .eq("id", item.id)
      .eq("branch_id", branchId);

    if (netError) {
      console.error("Insert failed:", netError.message);
    } else {
      console.log("Inserted successfully:", netIncome);
    }
  }
}

const netCalculator = (quantity, menuPrice) => {
  const pricePerBall = 3.285;
  const ballXquantity = pricePerBall * quantity;
  const netIncome = menuPrice - ballXquantity;

  return netIncome;
};
