import supabase from "../../Backend2/config/SupabaseClient.js";

const registerBtn = document.querySelector(".register-btn");

//* SIGNUP
registerBtn.addEventListener("click", async function () {
  const signinEmail = document.getElementById("signin_email").value;
  const signinPassword = document.getElementById("signin_password").value;
  const branch_name = document.getElementById("branch_name").value;
  const branch_loc = document.getElementById("branch_location").value;
  const duplicateEmail = document.getElementById("exist");

  try {
    // Step 1: Create a new branch
    const { data: branchData, error: branchError } = await supabase
      .from("branches_table")
      .insert([{ name: branch_name, location: branch_loc }])
      .select("id")
      .single();

    if (branchError) {
      console.error("Error creating branch:", branchError.message);
      return;
    }

    const branchId = branchData.id;

    // Step 2: Create the user
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: signinEmail,
      password: signinPassword,
    });

    if (userError) {
      console.error("Signup error:", userError.message);

      return;
    }

    const userId = userData.user.id;

    // Step 3: Insert user into `users_table` and link with branch_id
    const { error: insertError } = await supabase
      .from("users_table")
      .insert([{ id: userId, email: signinEmail, branch_id: branchId }]);

    if (insertError) {
      console.error("Error inserting user:", insertError.message);
      duplicateEmail.classList.remove("hidden");
      duplicateEmail.textContent = "Email already exists!";
      return;
    }

    // **Only Hide UI If Signup Succeeds**
    document.getElementById("signup_container").classList.toggle("hidden");
    document.getElementById("figure").classList.toggle("hidden");

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "verification.html";
    }, 2000);
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
});

// * show password

const closedEye = document.querySelector(".eye-icon");
const openEyes = document.querySelector(".eye-icons");
const password = document.getElementById("signin_password");
closedEye.addEventListener("click", function () {
  const closeEyes = document.getElementById("eye");
  const openEye = document.getElementById("eyes");

  if (password.type === "password") {
    password.type = "text";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});

openEyes.addEventListener("click", function () {
  const closeEyes = document.getElementById("eye");
  const openEye = document.getElementById("eyes");
  if (password.type === "text") {
    password.type = "password";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});

// * if user are login
// async function checkUser() {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     window.location.href = "index.html";
//   }
// }

// checkUser();
