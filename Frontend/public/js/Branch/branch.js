"strict";

import { renderBranches } from "./renderBranches.js";
renderBranches();
import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

export async function franchiseData() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: branches, error: branchesError } = await supabase
    .from("branches_table")
    .select("id,location,name,role")
    .neq("id", branchId);

  if (branchesError) {
    console.log("error fetiching branches", branchesError.message);
  }

  return {
    data: branches,
  };
}
