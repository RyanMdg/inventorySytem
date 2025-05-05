"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
const profile_name = document.getElementById("profile_name");
const form = document.getElementById("registerForm");
const redCheck = document.getElementById("redCheck");
const greenCheck = document.getElementById("greenCheck");

export async function profile() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: profileData, errorProfile } = await supabase
    .from("branches_table")
    .select("*")
    .eq("id", branchId);

  if (errorProfile) {
    console.log("error fetching data", errorProfile.message);
  }

  profileData.forEach((profile) => {
    profile_name.textContent = `${profile.name}`;
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault(); // prevent actual submit

  const data = new FormData(this);
  const values = Object.fromEntries(data.entries());
  const emptyFields = [];

  for (const [key, value] of Object.entries(values)) {
    if (!value.trim()) {
      emptyFields.push(key);
    }
  }

  if (emptyFields.length > 0) {
    const status = "registration failed!";
    const description = `Please fill in the following field(s):\n- ${emptyFields.join(
      "\n- "
    )}`;
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    dynamicAlert(status, description);
    return;
  }

  // No empty fields — you can now proceed
  console.log(values);
  const status = "New Franchise Account Registered!";
  const description = "Please notify them to verfiy there email accounts";
  greenCheck.classList.remove("hidden");
  redCheck.classList.add("hidden");
  dynamicAlert(status, description);

  this.reset();
});

profile();
