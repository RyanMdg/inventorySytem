"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const forgotpassBtn = document.getElementById("forgotpassBtn");
const emailInput = document.getElementById("emailInput");
const resetpassModal = document.getElementById("resetpassModal");
const proceedBtn = document.getElementById("proceedBtn");
const loading = document.getElementById("loading");
const resetPassModalContent = document.getElementById("resetPassModalContent");

forgotpassBtn.addEventListener("click", async function () {
  const email = emailInput.value;

  loading.classList.remove("hidden");
  emailInput.classList.add("hidden");
  let { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (data) {
    loading.classList.add("hidden");
    emailInput.classList.remove("hidden");
    resetpassModal.classList.remove(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
    resetpassModal.classList.add(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
  }
  if (error) {
    alert("Error: " + error.message);
  }
});

proceedBtn.addEventListener("click", function () {
  resetpassModal.classList.remove(
    "opacity-100",
    "scale-100",
    "pointer-events-auto",
    "bg-opacity-50"
  );
  resetpassModal.classList.add(
    "opacity-0",
    "scale-95",
    "pointer-events-none",
    "bg-opacity-0"
  );
});

resetpassModal.addEventListener("click", function () {
  if (!resetPassModalContent.contains(event.target)) {
    resetpassModal.classList.remove(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
    resetpassModal.classList.add(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
  }
});
