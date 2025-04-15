"use strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";

import { renderStocks } from "../renders/renderStocks.js";
import { renderaddedmixtures } from "../renders/renderaddedmixtures.js";
import { renderCreadtedMixtures } from "../renders/renderCreadtedMixtures.js";
import { renderleftOver } from "../renders/renderleftOver.js";
import { checkMixtures } from "../createdMixtures.js";

export async function subscribeToRealTimeOrders() {
  const channel = supabase.channel("inventory-channel"); // Create a real-time channel

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

  // Subscribe to the channel
  channel.subscribe();
}
