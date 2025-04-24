"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
const branchesProfileData = document.getElementById(
  "totalIncomeFranchiseContainer"
);

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
