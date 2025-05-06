"script";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { audit_Logs } from "../audit/audit.js";

const Logout = document.getElementById("logout");

Logout.addEventListener("click", async function handleLogout() {
  const { branchId, userId } = await getAuthUserAndBranch();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message);
  } else {
    audit_Logs(userId, branchId, "logout", "logout");
    dynamicAlert("Logged out successfully", "See You!");
    window.location.href = "index.html";
  }
});
