"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";

const profile_name = document.getElementById("profile_name");
const form = document.getElementById("registerForm");
const redCheck = document.getElementById("redCheck");
const greenCheck = document.getElementById("greenCheck");

// Load and display current profile name

// Main form handler
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
    // Create branch
    const { data: branchData, error: branchErr } = await supabase
      .from("branches_table")
      .insert([
        {
          name: values.franchiseeName,
          location: values.branchLocation,
        },
      ])
      .select("id")
      .single();

    if (branchErr) throw branchErr;
    const branchId = branchData.id;

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
        name: values.franchiseeName,
        role: "franchisee",
        branch_id: branchId,
      },
    ]);
    if (userErr) throw userErr;

    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(
      "New Franchise Account Registered!",
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

// initialize
