"strict";
import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";

const select = document.getElementById("audit_categories");
const audit_container = document.getElementById("audit_container");

let fullAuditLogs = [];

const formattedDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export async function render_Audit_logs(logs) {
  audit_container.innerHTML = "";

  logs.forEach((audit) => {
    const formattedStatus = audit.actions.replace(/\n/g, "<br>");
    audit_container.innerHTML += `
      <div class="border py-7 mx-auto px-3 rounded-sm mx-20 w-[70%] cursor-pointer active:translate-y-[2rem] transition-transform duration-200 bg-[#ffff] shadow drop-shadow-sm flex gap-40 items-start mb-10">
        <div class="flex w-full justify-between gap-3 ms-5">
          <span class="flex gap-5 ms-10  -mb-60">
           <div>
          <img src="/public/images/check_bold.png" />
           </div>
          <span class=" flex-col">
           <p class="font-medium text-lg"> 
            ${audit.name}</p>
            <span class="text-[#7a7979] text-[.8rem]">${audit.role}</span>  
          </span>
                 
          </span>
          <div class=" flex items-center">
          <h1 class="font-medium text-lg">${formattedStatus}</h1>
          </div>
          <span class=" flex flex-col">
          <h1 class="font-medium text-lg ms-3">${formattedDate(audit.date)}</h1>
          <h1 class="font-medium text-lg ms-3">${formatTime(
            audit.created_at
          )}</h1>
          </span>
          
        </div>
      </div>
    `;
  });
}

// Initial fetch and setup
export async function initAuditLogs() {
  const { branchId } = await getAuthUserAndBranch();

  const { data: auditData, error: auditError } = await supabase
    .from("audit")
    .select("*")
    .eq("branch_id", branchId)
    .order("date", { ascending: false });

  if (auditError) {
    console.error("Failed fetching audit data", auditError.message);
    return;
  }

  fullAuditLogs = auditData;
  render_Audit_logs(fullAuditLogs);
}

select.addEventListener("change", () => {
  const selectedCategory = select.value;

  const filteredLogs =
    selectedCategory === "All Categories"
      ? fullAuditLogs
      : fullAuditLogs.filter((log) => log.category === selectedCategory);

  render_Audit_logs(filteredLogs);
});

initAuditLogs();
