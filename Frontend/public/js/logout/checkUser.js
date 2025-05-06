"strict";
import supabase from "../../Backend2/config/SupabaseClient.js";

async function checkUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!session || error) {
    console.warn("Not authenticated. Redirecting to login...");
    window.location.href = "index.html"; // or your login page
  }
}

checkUser();
