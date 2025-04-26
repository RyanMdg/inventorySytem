"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

export async function branchStockAlert(branchid) {
  const branchStockAlert = document.getElementById("stockAlert");

  const { data: stockAlert, error: error } = await supabase
    .from("inventory_table")
    .select("*")
    .eq("branch_id", branchid);

  branchStockAlert.innerHTML = "";

  stockAlert.forEach((stocks) => {
    const remainStocks = stocks.quantity;

    if (remainStocks < 4) {
      branchStockAlert.innerHTML += `
      <li class=" flex items-center gap-5">
      <ion-icon class=" text-[1rem] text-red-700" name="warning"></ion-icon>
        <h1 class="text-[1rem]">
           ${stocks.raw_mats} -
          <span>
          ${stocks.quantity}
            </span>pcs left
        </h1>
        <p  class="text-[1rem]">
         Restock Soon!
        </p>
      </li>
      `;
    } else if (remainStocks > 4 && remainStocks <= 6) {
      branchStockAlert.innerHTML += `
      <li class=" flex items-center gap-5">
      <ion-icon class=" text-[1rem] text-amber-600" name="warning"></ion-icon>
        <h1 class="text-[1rem]">
           ${stocks.raw_mats} -
          <span>
          ${stocks.quantity}
            </span>pcs left
        </h1>
        <p  class="text-[1rem]">
         Low
        </p>
      </li>
      `;
    }
  });

  if (error) {
    console.warn("Error fetching branch stocks alert", error.message);
  }
}
