"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";

const leftOverBtn = document.getElementById("leftoverBtn");
const noleftalertContainer = document.getElementById("noleftmixtures");
const leftOverMixtures = document.getElementById("leftovertablemixture");

// Function to check if there are Created_Mixtures
async function checkleftovermixture() {
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
  const { data: createdLeftovers, error } = await supabase
    .from("mixtures_table")
    .select("*")
    .eq("branch_id", branchId)
    .eq("status", "Leftover_Mixture");

  if (error) {
    console.error("Error fetching mixtures:", error);
    return;
  }

  // If there are created mixtures, remove the alert and show the table
  if (createdLeftovers.length > 0) {
    noleftalertContainer?.remove(); // Remove if it exists
    leftOverMixtures?.classList.remove("hidden"); // Show the mixture table
  } else {
    // If no created mixtures exist, ensure the alert is shown
    noleftalertContainer?.classList.remove("hidden");
    leftOverMixtures?.classList.add("hidden");
  }
}

// Run checkleftovermixture() on page load
document.addEventListener("DOMContentLoaded", checkleftovermixture);

leftOverBtn.addEventListener("click", async function () {
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
    .update({ status: "Leftover_Mixture" })
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (error) {
    console.error("Error updating data:", error);
  } else {
    console.log("Data updated successfully:", data);

    alert("succesfull mixture are leftover");
  }

  // mixture status dynamically
  checkleftovermixture();
});
