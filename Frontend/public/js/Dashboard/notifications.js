import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

const icons = {
  login: "person-circle-outline",
  Completed: "checkmark-done-circle-outline",
  mixture: "restaurant-outline",
  added: "add-circle-outline",
  "Place Order": "receipt-outline",
  // Add more as needed
};

function getIcon(category) {
  return icons[category] || "notifications-outline";
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const notificationsList = document.getElementById("notifications-list");
  if (!notificationsList) return;

  const { branchId } = await getAuthUserAndBranch();
  const { data: audits, error } = await supabase
    .from("audit")
    .select("name, role, date, actions, category")
    .eq("branch_id", branchId)
    .order("date", { ascending: false })
    .limit(5);

  if (error) {
    notificationsList.innerHTML = "<li class='text-red-500'>Failed to load notifications.</li>";
    return;
  }

  if (!audits || audits.length === 0) {
    notificationsList.innerHTML = "<li class='text-gray-500'>No notifications found.</li>";
    return;
  }

  notificationsList.innerHTML = audits.map(audit => `
    <li class="flex gap-3 items-start">
      <span class="mt-1">
        <ion-icon name="${getIcon(audit.category)}" class="text-2xl text-gray-500"></ion-icon>
      </span>
      <div>
        <div class="font-semibold text-sm">${audit.category || "Update"}</div>
        <div class="text-gray-700 text-xs">
          <span class="font-bold">${audit.actions}</span><br>
          <span>${audit.name} (${audit.role})</span>
        </div>
        <div class="text-gray-400 text-xs">${timeAgo(audit.date)}</div>
      </div>
    </li>
  `).join("");

  // View All logic
  const viewAllBtn = document.getElementById("viewAllNotifications");
  const modal = document.getElementById("allNotificationsModal");
  const allList = document.getElementById("all-notifications-list");
  const closeBtn = document.getElementById("closeAllNotifications");

  if (viewAllBtn && modal && allList && closeBtn) {
    viewAllBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      // Fetch all notifications for the branch
      const { branchId } = await getAuthUserAndBranch();
      const { data: allAudits, error: allError } = await supabase
        .from("audit")
        .select("name, role, date, actions, category")
        .eq("branch_id", branchId)
        .order("date", { ascending: false });
      if (allError) {
        allList.innerHTML = "<li class='text-red-500'>Failed to load notifications.</li>";
        return;
      }
      if (!allAudits || allAudits.length === 0) {
        allList.innerHTML = "<li class='text-gray-500'>No notifications found.</li>";
        return;
      }
      allList.innerHTML = allAudits.map(audit => `
        <li class=\"flex gap-3 items-start\">
          <span class=\"mt-1\">
            <ion-icon name=\"${getIcon(audit.category)}\" class=\"text-2xl text-gray-500\"></ion-icon>
          </span>
          <div>
            <div class=\"font-semibold text-sm\">${audit.category || "Update"}</div>
            <div class=\"text-gray-700 text-xs\">
              <span class=\"font-bold\">${audit.actions}</span><br>
              <span>${audit.name} (${audit.role})</span>
            </div>
            <div class=\"text-gray-400 text-xs\">${timeAgo(audit.date)}</div>
          </div>
        </li>
      `).join("");
    });
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
}); 