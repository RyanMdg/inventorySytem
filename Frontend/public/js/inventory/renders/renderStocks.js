"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
const notifContainer = document.getElementById("notificationcontainer");
const inventory_status = document.getElementById("inventory_status");
const inventoryData = document.getElementById("inventory-data");

export async function renderStocks() {
  const { branchId } = await getAuthUserAndBranch();
  const inventory_status = document.getElementById("inventory_status");

  // Elements
  const notifContainer = document.getElementById("notificationcontainer");
  const notifbadge = document.getElementById("notifBadge");
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationDropdown = document.getElementById("notificationDropdown");

  async function fetchAndRenderInventory(status) {
    const { data, error } = await supabase
      .from("inventory_table")
      .select("total, quantity, unit, raw_mats, prices, exp_date, prchse_date")
      .eq("branch_id", branchId)
      .eq("status", status);

    if (error) {
      console.error("Error fetching inventory:", error.message);
      return;
    }

    inventoryData.innerHTML = "";
    notifContainer.innerHTML = "";
    let notifCount = 0;

    data.forEach((item) => {
      const quantity = Number(item.quantity);

      const formattedExpDate = new Date(item.exp_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      const formattedPrchseDate = new Date(item.prchse_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      if (quantity < 3) {
        notifCount++;
        notifContainer.innerHTML += `
          <li class="p-3 hover:bg-gray-100 cursor-pointer bg-[#f2f4f8] mx-3 mb-5 shadow drop-shadow-sm ">
            <p class="text-sm text-gray-700">
              <span class="text-[#B60205] font-semibold">${item.raw_mats}</span> is low on stock!
              Only <span class="text-[#B60205] font-semibold">${quantity} ${item.unit}</span> left.
            </p>
          </li>
        `;
      }

      inventoryData.innerHTML += `
        <tr class="border-b border-b-neutral-700">
          <td class="raw-mats text-center inventoryContent px-4 py-4">${item.raw_mats}</td>
          <td class="exp-date font-bold text-center inventoryContent px-4 py-4">${formattedPrchseDate}</td>
          <td class="exp-date font-bold text-center inventoryContent px-4 py-4">${formattedExpDate}</td>
          <td class="quantity text-center text-[1rem] font-bold inventoryContent px-4 py-4">${item.quantity}</td>
          <td class="unimeasure text-center inventoryContent px-4 py-4"><span>${item.unit}</span></td>
          <td class="px-4 text-center py-4">₱${item.prices}</td>
          <td class="px-4 text-center py-2">₱${item.total}</td>
        </tr>
      `;
    });

    notifbadge.textContent = notifCount;
  }

  // Initial render for "New" stock
  await fetchAndRenderInventory("new");

  // Change handler
  inventory_status.addEventListener("change", async () => {
    const selected = inventory_status.value.toLowerCase(); // in case it's "New"/"Old"
    await fetchAndRenderInventory(selected);
  });

  // Toggle dropdown
  notificationBtn.onclick = () => {
    notificationDropdown.classList.toggle("hidden");
  };

  document.addEventListener("click", (event) => {
    if (
      !notificationBtn.contains(event.target) &&
      !notificationDropdown.contains(event.target)
    ) {
      notificationDropdown.classList.add("hidden");
    }
  });
}
