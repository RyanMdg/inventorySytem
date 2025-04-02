"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const mixtureBtn = document.getElementById("mixtureBtn");
const nomixalertContainer = document.getElementById("nomixtures");
const createdMixture = document.getElementById("tablemixture");

// Function to check if there are Created_Mixtures
async function checkMixtures() {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    console.error(authError?.message || "User not logged in");
    return;
  }

  const userId = userData.user.id;

  const { data: userBranch, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error(userError.message);
    return;
  }

  const branchId = userBranch.branch_id;

  // Fetch mixtures with "Created_Mixture" status
  const { data: createdMixes, error } = await supabase
    .from("mixtures_table")
    .select("*")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (error) {
    console.error("Error fetching mixtures:", error);
    return;
  }

  // If there are created mixtures, remove the alert and show the table
  if (createdMixes.length > 0) {
    nomixalertContainer?.remove(); // Remove if it exists
    createdMixture?.classList.remove("hidden"); // Show the mixture table
  } else {
    // If no created mixtures exist, ensure the alert is shown
    nomixalertContainer?.classList.remove("hidden");
    createdMixture?.classList.add("hidden");
  }
}

// Run checkMixtures() on page load
document.addEventListener("DOMContentLoaded", checkMixtures);

// Update status when the button is clicked
mixtureBtn.addEventListener("click", async function () {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    console.error(authError?.message || "User not logged in");
    return;
  }

  const userId = userData.user.id;

  const { data: userBranch, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error(userError.message);
    return;
  }

  const branchId = userBranch.branch_id;

  const { data, error } = await supabase
    .from("mixtures_table")
    .update({ status: "Created_Mixture" })
    .eq("branch_id", branchId)
    .eq("status", "Added_Mixture");

  if (error) {
    console.error("Error updating data:", error);
  } else {
    console.log("Data updated successfully:", data);

    alert("succesfull mixture are creted");
  }

  // mixture status dynamically
  checkMixtures();
});
