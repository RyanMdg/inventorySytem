"strict";

import supabase from "../../public/Backend2/config/SupabaseClient.js";

const forgotpassBtn = document.getElementById("forgotpassBtn");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const newPassBtn = document.getElementById("newPassBtn");

forgotpassBtn.addEventListener("click", async function () {
  const email = emailInput.value;
  let { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (data) {
    alert("recovery email send!");
  }
  if (error) {
    alert("Error: " + error.message);
  }
});

newPassBtn.addEventListener("click", async function () {
  const newPass = passwordInput.value;
  const { data, error } = await supabase.auth.updateUser({
    password: newPass,
  });

  if (data) {
    alert("password successfully change!!");
  }
  if (error) {
    alert("Error: " + error.message);
  }
});
