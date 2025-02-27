import supabase from "../Backend2/config/SupabaseClient.js";

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

  localStorage.setItem("branch_id", userData.branch_id);
  console.log("Logged in with branch:", userData.branch_id);

  // Redirect to home page
  window.location.href = "home.html";
}

login_btn.addEventListener("click", async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  await login(email, password);
});

// * Check if user is logged in
async function checkUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    console.warn("No user found. Redirecting to login page...");
    window.location.href = "index.html";
  }
}

// Run the checkUser function if needed
// checkUser();
