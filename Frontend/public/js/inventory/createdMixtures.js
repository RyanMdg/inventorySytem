"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

const mixtureBtn = document.getElementById("mixtureBtn");
const nomixalertContainer = document.getElementById("nomixtures");
const createdMixture = document.getElementById("tablemixture");
const mixtureModal = document.getElementById("mixtureModal");
const leftoverModal = document.getElementById("leftoverModal");

// Function to check if there are Created_Mixtures
export async function checkMixtures() {
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
  const { branchId } = await getAuthUserAndBranch();

  const leftoverCount = await checkLeftovers(branchId);
  const CreatedMixtureCount = await checkCreatedMixture(branchId);

  if (leftoverCount > 0) {
    leftoverModal.classList.remove(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
    leftoverModal.classList.add(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
  } else if (CreatedMixtureCount > 0) {
    mixtureModal.classList.remove(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
    mixtureModal.classList.add(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
  } else {
    const { data, error } = await supabase
      .from("mixtures_table")
      .update({ status: "Created_Mixture" })
      .eq("branch_id", branchId)
      .eq("status", "Added_Mixture");

    if (error) {
      console.error("Error updating data:", error);
    } else {
      console.log("Data updated successfully:", data);
      alert("Successful mixture creation.");
    }

    // mixture status dynamically
    checkMixtures();
  }

  const { data: mixtureTable, error: errorMixture } = await supabase
    .from("mixtures_table")
    .select("total")
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (errorMixture) {
    console.error("Error fetching receipts:", errorMixture.message);
  }

  const total = mixtureTable.reduce((sum, row) => sum + (row.total || 0), 0);

  const { data, error } = await supabase.from("mixtures_summary_table").insert([
    {
      branch_id: branchId,
      total: total,
      status: "Created_Mixture",
    },
  ]);
  if (error) {
    console.error("Error inserting order:", error.message);
    alert("Error placing order. Please try again.");
    return;
  }
});

// * CHECK IF THERES LEFTOVERS
async function checkLeftovers(branchId) {
  const { count, error: countError } = await supabase
    .from("mixtures_table")
    .select("*", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .eq("status", "Leftover_Mixture");

  if (countError) {
    console.error("Error fetching leftover count:", countError);
    return 0;
  }

  console.log(`Leftover mixtures: ${count}`);
  return count;
}

// * CHECK IF THERES ALREADY CREATED MIXTURE

async function checkCreatedMixture(branchId) {
  const { count, error: countError } = await supabase
    .from("mixtures_table")
    .select("*", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .eq("status", "Created_Mixture");

  if (countError) {
    console.error("Error fetching leftover count:", countError);
    return 0;
  }

  console.log(`CREATED MIXTURE: ${count}`);
  return count;
}

// **MODAL

const modal = document.getElementById("leftoverModal");
const closeBtn = document.querySelector(".leftoverMixturesButtonclose");
const modalContent = document.getElementById("leftoverModalContent");

// Close when clicking the close button
closeBtn.addEventListener("click", function () {
  modal.classList.remove(
    "opacity-100",
    "scale-100",
    "pointer-events-auto",
    "bg-opacity-50"
  );
  modal.classList.add(
    "opacity-0",
    "scale-95",
    "pointer-events-none",
    "bg-opacity-0"
  );
});

// Close when clicking outside the modal content
modal.addEventListener("click", function (event) {
  if (!modalContent.contains(event.target)) {
    modal.classList.remove(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
    modal.classList.add(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
  }
});
