"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
const CreateinventoryData = document.getElementById("create-inventory-data");
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";

export async function renderaddedmixtures() {
  const dropdown = document.querySelector(".drpdwn");
  const finalSum = document.getElementById("sum");
  const { branchId } = await getAuthUserAndBranch();

  const { data: inventory, error: inventory_error } = await supabase
    .from("inventory_table")
    .select("raw_mats,unit")
    .eq("branch_id", branchId);

  if (inventory_error) {
    console.error("Error fetching products:", inventory_error.message);
    return;
  }

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats,quantity,unit,total")
    .eq("branch_id", branchId)
    .eq("status", "Added_Mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  const unitMap = new Map();

  dropdown.innerHTML = "";

  inventory.forEach((stock) => {
    dropdown.innerHTML += `
    <option value="${stock.raw_mats}">${stock.raw_mats}</option>
               
    `;
    unitMap.set(stock.raw_mats, stock.unit);
  });

  createRaw.addEventListener("change", () => {
    const selectedRaw = createRaw.value;
    const unit = unitMap.get(selectedRaw);
    createUnit.value = unit || "";
  });

  CreateinventoryData.innerHTML = "";
  let sum = 0;
  // Clear previous table data

  data.forEach((item) => {
    sum += item.total;
    CreateinventoryData.innerHTML += `
      <tr class="border-b border-b-neutral-700">
        <td contentEditable="false"  class="raw-mats inventoryContent px-4 text-center py-4">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity inventoryContent px-4 text-center py-4">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure font-bold inventoryContent text-center px-4 py-2">${item.unit}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>
      </tr>
     
    `;
  });
  finalSum.textContent = `₱${sum}`;
}
