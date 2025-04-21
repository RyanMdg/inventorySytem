"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
const branches_container = document.getElementById("branches_container");
const brancheProfileContainer = document.getElementById(
  "brancheProfileContainer"
);

export async function renderBranches() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: branches, error: branchesError } = await supabase
    .from("branches_table")
    .select("id,location,name,role")
    .neq("id", branchId);

  if (branchesError) {
    console.log("error fetiching branches", branchesError.message);
  }

  branches_container.innerHTML = "";

  branches.forEach((item) => {
    branches_container.innerHTML += `
    <a  class="bg-white flex cursor-pointer justify-center flex-col items-center gap-3  ms-10 py-5 px-10 rounded-md shadow drop-shadow-md " 
    
    >
    <figure>
      <img src="./images/branches_logo.png" alt="branch-icon" />
    </figure>
    
    <h1 class=" uppercase font-semibold">${item.name}</h1>
    <span class=" relative text-[#302D3D] flex justify-center items-center font-bold"><ion-icon class=" pb-2  text-[1.5rem] text-[#B60205]"  name="pin-sharp"></ion-icon>    ${item.location}</span>
  </a>
    `;
  });
}
