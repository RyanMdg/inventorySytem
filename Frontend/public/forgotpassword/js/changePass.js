"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const passwordInput = document.getElementById("passwordInput");
const newPassBtn = document.querySelector(".newPass");

newPassBtn.addEventListener("click", async function () {
  const newPass = passwordInput.value;
  const { data, error } = await supabase.auth.updateUser({
    password: newPass,
  });

  if (data) {
    alert("Password successfully changed!");
    window.location.href = "/";
  }
  if (error) {
    alert("Error: " + error.message);
  }
});
