"strict";

import supabase from "../../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../../../js/Authentication/auth-utils.js";

export async function topSellingProd() {
  const { branchId } = await getAuthUserAndBranch();
  const TopProductList = document.getElementById("TopProductList");
  const { data, error } = await supabase
    .from("top_products_view")
    .select("*")
    .eq("branch_id", branchId);

  if (error) {
    console.error("Error fetching top products:", error.message);
  } else {
    console.log("Top Products for This Branch:", data);
  }
  TopProductList.innerHTML = ``;

  data.forEach((item) => {
    TopProductList.innerHTML += `
    <li class=" flex gap-10 items-center "><img class=" w-[20%]" src="${item.img_url}" alt="">  ${item.product_name}</li>
    `;
  });
}

topSellingProd();
