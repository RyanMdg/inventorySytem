"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";

import { renderStocks } from "../renders/renderStocks.js";
import { renderIngredientTable, renderMenuTable } from "../../pos-inventory_communication/takoyaki-calculation.js";
import { renderaddedmixtures } from "../renders/renderaddedmixtures.js";
import { renderCreadtedMixtures } from "../renders/renderCreadtedMixtures.js";
import { renderleftOver } from "../renders/renderleftOver.js";
import { checkMixtures } from "../createdMixtures.js";
import { totalIncome } from "../../Dashboard/dashboard.js";
import { totalGrossIncome } from "../../Dashboard/renders/renderGrossIncome.js";
import { renderSalesChart } from "../../Dashboard/chart.js";

import { totalOrder } from "../../Dashboard/renders/renderTotalOrders.js";
import { renderFranchiseSalesChart } from "../../Branch/renderChart.js";
import { FranchiseeGrossIncome } from "../../Branch/renderBranchNetIncome.js";
import { FranchiseetotalIncome } from "../../Branch/renderBranchSales.js";
import {
  render_Audit_logs,
  initAuditLogs,
} from "../../audit/renders/renderAuditLogs.js";
import { renderRecentOrders } from "../../Dashboard/recentOrders.js";

export async function subscribeToRealTimeOrders() {
  const channel = supabase.channel("inventory-channel"); // Create a real-time channel
  const channeldashboard = supabase.channel("dashboard-channel");

  // Listen for changes in inventory_table
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "inventory_table",
    },
    (payload) => {
      // console.log("Inventory Table Change Detected:", payload);
      renderStocks();
      renderaddedmixtures(); // Refresh the table on changes
    }
  );

  // Listen for changes in mixtures_table
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "mixtures_table",
    },
    async (payload) => {
      // Refresh the table on changes
      // console.log("Mixtures Table Change Detected:", payload);
      renderaddedmixtures();
      await renderIngredientTable();
      await renderMenuTable();
      renderCreadtedMixtures();
      renderleftOver();
      checkMixtures();
    }
  );

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "mixtures_summary_table",
    },
    (payload) => {
      // Refresh the table on changes
      // console.log("mixtures_summary_table Change Detected:", payload);
      renderCreadtedMixtures();
    }
  );

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "pos_orders_table",
    },
    (payload) => {
      // Refresh the table on changes
      // console.log("mixtures_summary_table Change Detected:", payload);
      totalGrossIncome();
      renderRecentOrders();
    }
  );

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "audit",
    },
    async (payload) => {
      // Refresh the table on changes
      // console.log("audit Change Detected:", payload);
      initAuditLogs();
      await render_Audit_logs();
    }
  );

  // Listen for changes in reciept summary table
  channeldashboard.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "reciepts_summary_table",
    },
    async (payload) => {
    //console.log("reciepts_summary_table Change Detected:", payload);
      totalIncome();
      totalOrder();
      await renderSalesChart();
      await renderFranchiseSalesChart();
      await FranchiseeGrossIncome();
      await FranchiseetotalIncome();
    }
  );

  // Subscribe to the channel
  channel.subscribe();
  channeldashboard.subscribe();
}
