import supabase from "../Backend2/config/SupabaseClient.js";

const login_btn = document.querySelector(".login-btn");

login_btn.addEventListener("click", async function () {
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;
  console.log(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    document.getElementById("message").innerText =
      "Login failed: " + error.message;
    console.log("Error:", error);
  } else {
    document.getElementById("message").innerText =
      "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "home.html"; // Redirect after login
    }, 2000);
  }
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
