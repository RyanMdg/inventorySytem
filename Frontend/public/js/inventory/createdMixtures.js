"use strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
import { audit_Logs } from "../audit/audit.js";
import { calculateDynamicCostPerBall } from "../pos-inventory_communication/takoyaki-calculation.js";

const mixtureBtn = document.getElementById("mixtureBtn");
const nomixalertContainer = document.getElementById("nomixtures");
const createdMixture = document.getElementById("tablemixture");
const mixtureModal = document.getElementById("mixtureModal");
const leftoverModal = document.getElementById("leftoverModal");
const ok_container = document.getElementById("ok_container");
const use_discard_container = document.getElementById("use_discard_container");
const greenCheck = document.getElementById("greenCheck");
const redCheck = document.getElementById("redCheck");

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
  const { branchId, userId } = await getAuthUserAndBranch();

  const leftoverCount = await checkLeftovers(branchId);
  const CreatedMixtureCount = await checkCreatedMixture(branchId);

  if (leftoverCount > 0) {
    const status = "You Still have leftover mixtures!";
    const description = "Use it or discard?";
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    ok_container.classList.add("hidden");
    use_discard_container.classList.remove("hidden");
    dynamicAlert(status, description);
  } else if (CreatedMixtureCount > 0) {
    const status = "You still have mixture!";
    const description = "Finish it before creating a new one.";
    ok_container.classList.remove("hidden");
    use_discard_container.classList.add("hidden");
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");

    dynamicAlert(status, description);
  } else {
    // 1. Fetch all recipes
    const { data: recipes, error: recipeError } = await supabase
      .from("recipe_table")
      .select("*")
      .eq("branch_id", branchId);

    if (recipeError) {
      console.error("Error fetching recipes:", recipeError.message);
      return;
    }

    const pricePerBall = await calculateDynamicCostPerBall();
    console.log("Price Per Ball:", pricePerBall);
    // 2. Insert each recipe as a new mixture with status 'Created_Mixture'
    const inserts = recipes.map((recipe) => ({
      branch_id: branchId,
      raw_mats: recipe.raw_mats,
      quantity: recipe.quantity,
      unit: recipe.unit,
      prices: recipe.prices, // or whatever price field you use
      status: "Created_Mixture",
    }));

    const { error: insertError } = await supabase
      .from("mixtures_table")
      .insert(inserts);

    if (insertError) {
      console.error("Error inserting mixtures:", insertError.message);
      alert("Error creating mixture. Please try again.");
      return;
    }

    audit_Logs(userId, branchId, "Created a mixture", "mixture");
    const status = "Mixture Created!";
    const description = "Your now deducting to this mixtures!";
    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    ok_container.classList.remove("hidden");
    use_discard_container.classList.add("hidden");
    dynamicAlert(status, description);
    checkMixtures();
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
