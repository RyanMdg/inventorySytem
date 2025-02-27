"strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".addBtn");
const statusBtn = document.getElementById("statusButton");

console.log("hello pos");

async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) console.error("Error:", error);
  else console.log("Product:", data);
}

async function fetchUser() {
  // logged-in user
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    console.error(
      "Error fetching user:",
      authError?.message || "User not logged in"
    );
    return;
  }

  const userId = userData.user.id;

  const { data: userBranch, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user's branch:", userError.message);
    return;
  }

  const branchId = userBranch.branch_id;

  const { data: branchData, error: branchError } = await supabase
    .from("branches_table")
    .select("name")
    .eq("id", branchId)
    .single();

  if (branchError) {
    console.error("Error fetching branch name:", branchError.message);
    return;
  }

  console.log("Branch Name:", branchData.name);

  document.getElementById("branch-name").textContent = branchData.name;
}

fetchUser();

// * ONLINE/OFFLINE FUNCTIONS
statusBtn.addEventListener("click", function () {
  if (this.textContent === "Offline") {
    this.textContent = "Online";
    this.className =
      "text-[1rem] outline-1 drop-shadow-2xl transition-all shadow outline-[#B60205] text-[#B60205] rounded-3xl px-6 cursor-pointer";
  } else {
    this.textContent = "Offline";
    this.className =
      "text-[1rem] outline-1 drop-shadow-2xl transition-all shadow outline-[#302D3D] rounded-3xl px-6 cursor-pointer";
  }
});
