"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const mixturedContainer = document.getElementById("create-mixtures-data");
const nomixtures = document.getElementById("nomixtures");
const tableContainer = document.getElementById("tablemixture");
const mixtureBtn = document.getElementById("mixtureBtn");

mixtureBtn.addEventListener("click", async function rendercreatedMixtures() {
  const finalSum = document.getElementById("sum");

  const { data, error } = await supabase
    .from("mixtures_table")
    .select("raw_mats, quantity, unit, total")
    .eq("status", "mixture");

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  mixturedContainer.innerHTML = ""; // Clear previous content
  let sum = 0;

  // if (data.length === 0) {
  //   // Show a message if there are no mixtures
  //   nomixtures.innerHTML = `

  //             <img src="./images/tako.png" class=" w-[17rem] animate-bounce" alt="">
  //             <h2 class=" text-center text-[#ff4d4d] font-semibold" >
  //               ❌ You don't have any mixtures yet!
  //             </h2>
  //             <p style="text-align: center; color: #666;">
  //               Start creating mixtures to see them here.
  //             </p>
  //   `;
  //   tableContainer.remove();
  //   finalSum.textContent = "0.00"; // Reset sum
  //   return;
  // }

  data.forEach((item) => {
    sum += item.total;
    mixturedContainer.innerHTML += `
      <tr>
        <td class="raw-mats inventoryContent px-4 py-2">${item.raw_mats}</td>
        <td class="quantity inventoryContent px-4 py-2">${item.quantity}</td>
        <td class="unimeasure inventoryContent px-4 py-2">${item.unit}</td>
        <td class="px-4 py-2">${item.total}</td>
      </tr>
    `;
    tableContainer.classList.remove("hidden");
  });

  finalSum.textContent = sum.toFixed(2); // Ensure it's formatted properly
});

function subscribeToRealTimeOrders() {
  const channel = supabase.channel("inventory-channel"); // Create a real-time channel
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "mixtures_table",
    },
    (payload) => {
      console.log("Mixtures Table Change Detected:", payload);
      rendercreatedMixtures(); // Refresh the table on changes
    }
  );

  // Subscribe to the channel
  channel.subscribe();
}

document.addEventListener("DOMContentLoaded", function () {
  rendercreatedMixtures();
  subscribeToRealTimeOrders();
});
