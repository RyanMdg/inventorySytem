import supabase from "../../Backend2/config/SupabaseClient.js";
// Quick Actions event handlers
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";
document.addEventListener("DOMContentLoaded", () => {
  const newStockBtn = document.getElementById("quick-new-stock");
  const createMixtureBtn = document.getElementById("quick-create-mixture");
  const generateReportBtn = document.getElementById("quick-generate-report");

  if (newStockBtn) {
    newStockBtn.addEventListener("click", () => {
      // Find the sidebar inventory link and click it
      const inventoryLink = document.getElementById("inventory");
      if (inventoryLink) {
        inventoryLink.click();
      }
    });
  }

  if (createMixtureBtn) {
    createMixtureBtn.addEventListener("click", () => {
      const inventoryLink = document.getElementById("inventory");
      if (inventoryLink) {
        inventoryLink.click();
      }
    });
  }

  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", async () => {
      // Fetch sales data from reciepts_summary_table
      const { branchId} = await getAuthUserAndBranch();
      const { data: sales, error:error } = await supabase
        .from("reciepts_summary_table")
        .select("receipt_number, total, status, created_at, branch_id")
        .eq("branch_id", branchId);

      if (error) {
        alert("Failed to fetch sales data.");
        return;
      }

      // Convert to CSV
      const headers = ["Receipt Number", "Total", "Status", "Created At", "Branch ID"];
      const rows = sales.map(row =>
        [
          row.receipt_number,
          row.total,
          row.status,
          row.created_at,
          row.branch_id
        ].join(",")
      );
      const csvContent = [headers.join(","), ...rows].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sales_report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}); 