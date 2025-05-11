import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
import { dynamicAlert } from "../../modals_Js/dynamicInventory.js";

const Accountscontainer = document.getElementById("Accountscontainer");

export async function renderQuickLogs() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: quicklog, error: logError } = await supabase
    .from("quicklogins")
    .select("*")
    .eq("branch_id", branchId)
    .eq("isquicklog", true);
    

  if (logError) {
    console.error(logError);
  }

  Accountscontainer.innerHTML = "";
  if (quicklog && quicklog.length > 0) {
    quicklog.forEach(row => { 
      Accountscontainer.innerHTML += `
        <li>
          <button 
            class="quicklogAcc flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
            data-email="${row.email}"
            data-password="${row.password}"
          > 
            <img src="./images/human.png" class="w-[2rem]" alt="" srcset="">
            <span class="text-sm text-[#000000] font-semibold">${row.branchName}</span>
          </button>
        </li>
      `;
    });
  }

  // Set up click event listeners for the quick login buttons
  const quicklogAccButtons = document.querySelectorAll(".quicklogAcc");
  quicklogAccButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-email");
      const password = btn.getAttribute("data-password");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error);
        dynamicAlert("Error", error.message || "Failed to login");
      } else {
        console.log("Login successful, redirecting...");
        window.location.href = "/Frontend/public/home.html";
      }
    });
  });
}

renderQuickLogs();
