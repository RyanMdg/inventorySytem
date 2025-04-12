"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
const createdMixtures = document.getElementById("created_mixtures");
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";

export async function renderCreadtedMixtures() {
  const finalSum = document.getElementById("sum");
  const cretedmixturesum = document.getElementById("createdmixture_sum");

  const { branchId } = await getAuthUserAndBranch();

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats,quantity,unit,total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  createdMixtures.innerHTML = "";
  let createdsum = 0;
  // Clear previous table data

  data.forEach((item) => {
    createdsum += item.total;
    createdMixtures.innerHTML += `
      <tr class="border-b border-b-neutral-700">
        <td contentEditable="false"  class="raw-mats text-center inventoryContent px-4 py-4">${item.raw_mats}</td>
        <td contentEditable="false"  class="quantity text-center inventoryContent px-4 py-4">${item.quantity}</td>
        <td contentEditable="false"  class="unimeasure text-center font-bold inventoryContent px-4  py-2">${item.unit}</td>
        <td  class="px-4 text-center py-2">₱${item.total}</td>
      </tr>
     
    `;
  });
  cretedmixturesum.textContent = `₱${createdsum}`;
}
