import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "./auth-utils.js";
import { audit_Logs } from "../audit/audit.js";
const login_btn = document.querySelector(".login-btn");

async function login(email, password) {
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
    return;
  }

  const user = data.user;

  if (!user) {
    console.error("No user returned from login.");
    alert("Login failed. Please try again.");
    return;
  }

  console.log("User logged in:", user);

  // Fetch the user's branch_id
  const { data: userData, error: fetchError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Fetch error:", fetchError.message);
    alert("Failed to fetch branch information.");
    return;
  }

  const branch_id = userData.branch_id;
  localStorage.setItem("branch_id", branch_id);
  console.log("Logged in with branch:", branch_id);

  await audit_Logs(user.id, branch_id, "login", "login");

  //  AFTER ng audit log
  window.location.href = "../Frontend/public/home.html";
}

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Add Enter key event listener ONCE
[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      await login(email, password);
    }
  });
});

// // * Check if user is logged in
