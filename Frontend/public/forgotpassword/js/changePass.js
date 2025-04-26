"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const passwordInput = document.getElementById("passwordInput");
const newPassBtn = document.querySelector(".newPass");
const closedEyed = document.querySelector(".eye-icond");
const openEyesd = document.querySelector(".eye-iconsd");
const closedEyeda = document.querySelector(".eyed");
const openEyesda = document.querySelector(".eyeds");

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

closedEyed.addEventListener("click", function () {
  const closeEyess = document.getElementById("eyed");
  const openEyes = document.getElementById("eyesd");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  }
  closeEyess.classList.toggle("hidden");
  openEyes.classList.toggle("hidden");
});

openEyesd.addEventListener("click", function () {
  const closeEyesd = document.getElementById("eye");
  const openEyed = document.getElementById("eyes");
  if (passwordInput.type === "text") {
    passwordInput.type = "password";
  }
  closeEyesd.classList.toggle("hidden");
  openEyed.classList.toggle("hidden");
});

//////////////////***************/

closedEyeda.addEventListener("click", function () {
  const closeEyes = document.getElementById("closed-eyed");
  const openEye = document.getElementById("open-eyesd");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});

openEyesda.addEventListener("click", function () {
  const closeEyes = document.getElementById("closed-eyed");
  const openEye = document.getElementById("open-eyesd");
  if (passwordInput.type === "text") {
    passwordInput.type = "password";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});
