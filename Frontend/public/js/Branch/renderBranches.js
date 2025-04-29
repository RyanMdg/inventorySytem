"strict";
import supabase from "../../Backend2/config/SupabaseClient.js";
import { BranchIncome } from "./rendeBranchIncome.js";
import {
  renderFranchiseSalesChart,
  fetchWeeklyFranchise_GS,
} from "./renderChart.js";
import {
  FranchiseetotalIncome,
  setCurrentBranchId,
} from "./renderBranchSales.js";
import { FranchiseeGrossIncome, setBranch } from "./renderBranchNetIncome.js";
import { renderBranchInventory } from "./renderBranchInventory.js";
import { branchStockAlert } from "./renderBranchStockAlert.js";

const branches_container = document.getElementById("branches_container");

import { franchiseData } from "./branch.js";

export async function renderBranches() {
  const { data } = await franchiseData();

  branches_container.innerHTML = "";

  data.forEach((item, index) => {
    branches_container.innerHTML += `
       <a id=""  class="bg-white branchBtn flex cursor-pointer justify-center flex-col items-center gap-3  ms-10 py-5 px-10 rounded-md shadow drop-shadow-md " 
     @click="branchPage = 'branchesProfileData'"  data-index="${index}"
    >
        <figure>
          <img src="./images/branches_logo.png" alt="branch-icon" />
        </figure>
        <h1 class="uppercase font-semibold">${item.name}</h1>
        <span class="relative text-[#302D3D] flex justify-center items-center font-bold">
          <ion-icon class="pb-2 text-[1.5rem] text-[#B60205]" name="pin-sharp"></ion-icon>
          ${item.location}
        </span>
      </a>
    `;
  });

  const refreshBtn = document.getElementById("refreshBtn");

  const backBtn = document.getElementById("backBtn");
  const branchData = document.getElementById("branchData");

  const branchBtns = document.querySelectorAll(".branchBtn");
  const branchNameHeader = document.getElementById("branchNameHeader");

  branchBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const index = this.getAttribute("data-index");
      const selectedBranch = data[index];
      branchNameHeader.innerHTML = selectedBranch.name;
      backBtn.classList.remove("hidden");
      refreshBtn.classList.remove("hidden");
      branchData.classList.remove("hidden");
      BranchIncome(selectedBranch);
      fetchWeeklyFranchise_GS(selectedBranch.id);
      renderFranchiseSalesChart(selectedBranch.id);
      setCurrentBranchId(selectedBranch.id);
      setBranch(selectedBranch.id);
      FranchiseetotalIncome("today", selectedBranch.id);
      FranchiseeGrossIncome("today", selectedBranch.id);
      renderBranchInventory(selectedBranch.id);
      branchStockAlert(selectedBranch.id);

      refreshBtn.addEventListener("click", async () => {});
    });
  });
}
