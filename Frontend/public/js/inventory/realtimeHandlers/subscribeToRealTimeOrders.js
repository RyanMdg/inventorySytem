"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";

import { renderStocks } from "../renders/renderStocks.js";
import { renderaddedmixtures } from "../renders/renderaddedmixtures.js";
import { renderCreadtedMixtures } from "../renders/renderCreadtedMixtures.js";
import { renderleftOver } from "../renders/renderleftOver.js";
import { checkMixtures } from "../createdMixtures.js";
import { totalIncome } from "../../Dashboard/dashboard.js";
import { totalGrossIncome } from "../../Dashboard/renders/renderGrossIncome.js";
import { renderSalesChart } from "../../Dashboard/chart.js";
import { fetchWeeklyGrossSales } from "../../Dashboard/chart.js";
import { totalOrder } from "../../Dashboard/renders/renderTotalOrders.js";
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
      console.log("Inventory Table Change Detected:", payload);
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
    (payload) => {
      // Refresh the table on changes
      console.log("Mixtures Table Change Detected:", payload);
      renderaddedmixtures();
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
      console.log("mixtures_summary_table Change Detected:", payload);
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
      console.log("mixtures_summary_table Change Detected:", payload);
      totalGrossIncome();
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
      console.log("reciepts_summary_table Change Detected:", payload);
      totalIncome();
      totalOrder();
      await renderSalesChart(); // Refresh the table on changes
    }
  );

  // Subscribe to the channel
  channel.subscribe();
  channeldashboard.subscribe();
}
