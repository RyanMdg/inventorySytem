"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
const branchStocksList = document.getElementById("branchStocksList");
export async function renderBranchInventory(branchId) {
  const { data: branchInventory, error: error } = await supabase
    .from("inventory_table")
    .select("*")
    .eq("branch_id", branchId);

  branchStocksList.innerHTML = "";

  branchInventory.forEach((inventory) => {
    branchStocksList.innerHTML += `
      <li class=" flex gap-[8rem] w-[48%] px-5 py-2">
                    <h1 class=" text-[1.2rem]">${inventory.raw_mats}</h1>
                    <p class=" text-[1.2rem]">${inventory.quantity}</p>
      </li>
    
    `;
  });
}
