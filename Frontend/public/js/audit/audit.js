"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

export async function audit_Logs(
  userId,
  branchid,
  actions,
  category,
  orderName
) {
  const { data: branchData, error: errorBranchData } = await supabase
    .from("users_table")
    .select("*")
    .eq("branch_id", branchid)
    .eq("id", userId);

  if (errorBranchData) {
    console.error("Error fetching branch", errorBranchData.message);
  }

  if (Array.isArray(branchData)) {
    for (const branch of branchData) {
      const { data: audit_data, error: audit_error } = await supabase
        .from("audit")
        .insert([
          {
            branch_id: branchid,
            name: branch.name,
            role: branch.role,
            actions: actions,
            category: category,
            order_name: orderName,
            date: new Date().toISOString(),
          },
        ]);

      if (audit_error) {
        console.error("Insert error:", audit_error);
      } else {
        console.log("Inserted audit log:", audit_data);
      }
    }
  } else {
    console.log("No branch data found or unexpected format:", branchData);
  }
}
