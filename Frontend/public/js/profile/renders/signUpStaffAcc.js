"strict";

import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
import { dynamicAlert } from "../../modals_Js/dynamicInventory.js";
import supabase from "../../../Backend2/config/SupabaseClient.js";

const form = document.getElementById("addStaff");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  //  Gather form values
  const formData = new FormData(this);
  const values = Object.fromEntries(formData.entries());

  //  Validate blanks
  const empty = Object.entries(values)
    .filter(([, v]) => !v.trim())
    .map(([k]) => k);

  if (empty.length) {
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    return dynamicAlert(
      "Registration failed!",
      `Please fill in the following field(s):\n- ${empty.join("\n- ")}`
    );
  }

  try {
    const { branchId } = await getAuthUserAndBranch();
    // Sign up user
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (signErr) throw signErr;
    const userId = signData.user.id;

    const { error: userErr } = await supabase.from("users_table").insert([
      {
        id: userId,
        email: values.email,
        password: values.password,
        name: values.name,
        role: "staff",
        branch_id: branchId,
      },
    ]);
    if (userErr) throw userErr;

    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(
      "New Staff Account register!",
      "Please notify them to verify their email accounts."
    );

    this.reset();
  } catch (err) {
    console.error(err.message);
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    dynamicAlert(
      "Error registering new franchise account",
      err.message.includes("duplicate key")
        ? "Email already exists!"
        : err.message
    );
  }
});
