"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

import { renderBranches } from "./renderBranches.js";
const branchesProfileData = document.getElementById(
  "totalIncomeFranchiseContainer"
);
const branchData = document.getElementById("branchData");

const backBtn = document.getElementById("backBtn");
export async function BranchIncome(selectedBranch) {
  const branchId = selectedBranch.id;

  const { data: prod, error: prodError } = await supabase
    .from("products_table")
    .select("*")
    .eq("branch_id", branchId);

  if (prodError) {
    console.error("Error fetching employees:", prodError.message);
  }

  branches_container.classList.add("hidden");
  branchesProfileData.classList.remove("hidden");
}

backBtn.addEventListener("click", function () {
  const branches_container = document.getElementById("branches_container");
  const backBtn = document.getElementById("backBtn");
  const branchNameHeader = document.getElementById("branchNameHeader");

  branchNameHeader.innerHTML = "Branches";

  backBtn.classList.add("hidden");
  branchData.classList.add("hidden");
  branches_container.classList.remove("hidden");
});
