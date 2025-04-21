"strict";
import supabase from "../../Backend2/config/SupabaseClient.js";
import { BranchIncome } from "./rendeBranchIncome.js";
const branches_container = document.getElementById("branches_container");
const branchesProfileData = document.getElementById("branchesProfileData");

import { franchiseData } from "./branch.js";

export async function renderBranches() {
  const { data } = await franchiseData();
  branches_container.innerHTML = "";
  branchesProfileData.innerHTML = "";

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

  const branchBtns = document.querySelectorAll(".branchBtn");

  branchBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const index = this.getAttribute("data-index");
      const selectedBranch = data[index];
      BranchIncome(selectedBranch);
    });
  });
}
