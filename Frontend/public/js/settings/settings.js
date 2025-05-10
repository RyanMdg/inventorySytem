console.log("settings js is loaded");
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
import supabase from "../../Backend2/config/SupabaseClient.js";

const aside = document.getElementById("asides");
const settingsBtn = document.getElementById("settingsBtn");
const asidesForSettings = document.getElementById("asidesForSettings");
const navTextContent = document.getElementById("navTextContent");
const aside2 = document.getElementById("aside2");


