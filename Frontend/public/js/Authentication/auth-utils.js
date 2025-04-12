"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

export async function getAuthUserAndBranch() {
  // Get authenticated user
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.user) {
    throw new Error(authError?.message || "User not authenticated");
  }

  // Get user's branch ID
  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", user.user.id)
    .single();

  if (userError || !userData) {
    throw new Error(userError?.message || "Branch ID not found");
  }

  return {
    userId: user.user.id,
    branchId: userData.branch_id,
  };
}
