"script";

import { getAuthUserAndBranch } from "../Authentication/auth-utils";
import { dynamicAlert } from "../modals_Js/dynamicInventory";
import supabase from "../../Backend2/config/SupabaseClient.js";

const aside = document.getElementById("asides");
const settingsBtn = document.getElementById("settingsBtn");

settingsBtn.addEventListener("click", function () {
  aside.classList.add("hidden");
  console.log("hello");
});
