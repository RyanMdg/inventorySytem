import supabase from "../Backend2/config/SupabaseClient.js";

const registerBtn = document.querySelector(".register-btn");

//* SIGNUP
async function signUp(email, password, Name, branchLocation) {
  // Step 1: Create a new branch
  const { data: branchData, error: branchError } = await supabase
    .from("branches_table")
    .insert([{ name: Name, location: branchLocation }])
    .select("id") // Fetch the created branch ID
    .single();

  if (branchError) {
    console.error("Error creating branch:", branchError.message);
    return;
  }

  const branchId = branchData.id; // Get the newly created branch ID

  // Step 2: Create the user and associate with branch
  const { data: userData, error: userError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (userError) {
    console.error("Signup error:", userError.message);
    return;
  }

  const userId = userData.user.id; // Get the newly created user ID

  // Step 3: Insert user into the `users` table and link with branch_id
  const { error: insertError } = await supabase
    .from("users_table")
    .insert([{ id: userId, email, branch_id: branchId }]);

  if (insertError) {
    console.error("Error inserting user:", insertError.message);
  } else {
    console.log("User registered with branch:", branchId);
    alert(`New franchisee registered with ${branchName}`);
  }
}

registerBtn.addEventListener("click", async function () {
  const signinEmail = document.getElementById("signin_email").value;
  const signinPassword = document.getElementById("signin_password").value;
  const branch_name = document.getElementById("branch_name").value;
  const branch_loc = document.getElementById("branch_location").value;

  await signUp(signinEmail, signinPassword, branch_name, branch_loc);
});
