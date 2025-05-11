import supabase from "../../Backend2/config/SupabaseClient.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

const quicklogname = document.getElementById("quicklogname");
const quicklogemail = document.getElementById("quicklogemail");
const quicklogpass = document.getElementById("quicklogpass");
const quicklogbtn = document.getElementById("quickLogin_container");

quicklogbtn.addEventListener("click", async () => {
  const {branchId} = await getAuthUserAndBranch();
  const { data, error } = await supabase
    .from("quicklogins")
    .insert({
      branchName: quicklogname.value,
      isquicklog: true,
      email: quicklogemail.value,
      password: quicklogpass.value,
      branch_id: branchId,
    });

  if (error) {
    console.error(error);
    dynamicAlert("Error", error.message || "Failed to update quick login");
  } else {
    dynamicAlert(
      "Success",
      "Updated as a quick login"
    );
  }
});


