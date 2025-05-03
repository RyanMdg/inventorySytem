"strict";
import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
const audit_container = document.getElementById("audit_container");

export async function render_Audit_logs() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: auditData, error: auditError } = await supabase
    .from("audit")
    .select("*")
    .eq("branch_id", branchId)
    .order("date", { ascending: false });

  if (auditError) {
    console.error("Failed fetching audit data", auditError.message);
  }

  audit_container.innerHTML = "";

  auditData.forEach((audit) => {
    audit_container.innerHTML += `

            <div
              class="border py-7 mx-auto px-3 rounded-sm mx-20 w-[70%] bg-[#ffff] border-[#9CA3AF] flex gap-40 justify-between items-start mb-10"
            >
            <div  class="flex justify-around gap-3 ms-5">
                <img src="../public/images/check bold.png" />
                <span class="flex flex-col gap-1 -mb-60">
                  <p class="font-medium text-lg ms-3">${audit.name}</p>
                </span>
                <h1 class="font-medium text-lg">${audit.actions}</h1>
              
                <h1  class="font-medium text-lg ms-3">${audit.date}</h1>
                <h1  class="font-medium text-lg ms-3">${formatTime(
                  audit.created_at
                )}</h1>
              </div>
              
            </div>

    
    `;
  });
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

render_Audit_logs();
