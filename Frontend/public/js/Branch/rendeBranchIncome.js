"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

export async function BranchIncome(selectedBranch) {
  const branchId = selectedBranch.id;

  const { data: prod, error: prodError } = await supabase
    .from("products_table")
    .select("*")
    .eq("branch_id", branchId);

  if (prodError) {
    console.error("Error fetching employees:", prodError.message);
  }

  // Hide list, show profile
  branches_container.classList.add("hidden");
  branchesProfileData.classList.remove("hidden");

  // Show only the selected branch's data
  branchesProfileData.innerHTML = `
        <h1 class="text-2xl font-bold">${selectedBranch.name}</h1>
        <p class="text-gray-700">Location: ${selectedBranch.location}</p>
         ${prod.map((emp) => `<p>${emp.name}</p>`).join("")}
        <p class="text-gray-500">Role: ${selectedBranch.role}</p>
      `;
}
