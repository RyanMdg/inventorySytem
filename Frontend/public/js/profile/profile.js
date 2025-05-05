"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";

const profile_name = document.getElementById("profile_name");
const form = document.getElementById("registerForm");
const redCheck = document.getElementById("redCheck");
const greenCheck = document.getElementById("greenCheck");

// Load and display current profile name
export async function profile() {
  try {
    const { branchId } = await getAuthUserAndBranch();
    const { data, error } = await supabase
      .from("branches_table")
      .select("name")
      .eq("id", branchId)
      .single();

    if (error) throw error;
    profile_name.textContent = data.name;
  } catch (err) {
    console.error("Error fetching profile:", err.message);
  }
}

// Main form handler
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // 1️⃣ Gather form values
  const formData = new FormData(this);
  const values = Object.fromEntries(formData.entries());

  // 2️⃣ Validate blanks
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
          role: "franchise",
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

    // Link user to branch in users_table
    const { error: userErr } = await supabase.from("users_table").insert([
      {
        id: userId,
        email: values.email,
        password: values.password,
        branch_id: branchId,
      },
    ]);
    if (userErr) throw userErr;

    // Success: toggle UI, alert, reset form, redirect
    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(
      "New Franchise Account Registered!",
      "Please notify them to verify their email accounts."
    );

    this.reset();
  } catch (err) {
    // Unified error handler
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
profile();
