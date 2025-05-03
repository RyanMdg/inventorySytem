"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
import { audit_Logs } from "../audit/audit.js";

const leftOverBtn = document.getElementById("leftoverBtn");
const noleftalertContainer = document.getElementById("noleftmixtures");
const leftOverMixtures = document.getElementById("leftovertablemixture");
const UseLeftOverBtn = document.getElementById("UseLeftOverBtn");
const leftoverModal = document.getElementById("leftoverModal");
const ok_container = document.getElementById("ok_container");
const use_discard_container = document.getElementById("use_discard_container");
const greenCheck = document.getElementById("greenCheck");
const redCheck = document.getElementById("redCheck");

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

//* Run checkleftovermixture() on page load
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
    const update = `Mixture moved to leftover`;
    audit_Logs(branchId, update);
    const status = "Leftover Created!";
    const description = "Successfully Mixture are leftover!";
    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(status, description);
  }

  // mixture status dynamically
  checkleftovermixture();
});

// * USE LEFT OVER BUTTON ON MODAL POP UP

UseLeftOverBtn.addEventListener("click", async function () {
  const { branchId } = await getAuthUserAndBranch();
  const modal = document.getElementById("leftoverModal");
  const closeBtn = document.querySelector(".leftoverMixturesButtonclose");

  const { data, error } = await supabase
    .from("mixtures_table")
    .update({ status: "Created_Mixture" })
    .eq("branch_id", branchId)
    .eq("status", "Leftover_Mixture");

  if (error) {
    console.error("Error updating data:", error);
  } else {
    console.log("Data updated successfully:", data);
    const audit_status = `leftover used as mixture`;
    audit_Logs(branchId, audit_status);
    const status = "Successful leftover use as mixture!";
    const description = "You are currently deducting in your leftovers";
    ok_container.classList.remove("hidden");
    use_discard_container.classList.add("hidden");
    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(status, description);
  }
  checkleftovermixture();
});
