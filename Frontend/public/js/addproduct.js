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

async function addProduct(product_name, product_price) {
  const { data, error } = await supabase
    .from("products")
    .insert([{ product_name, product_price }]);

  if (error) console.log("Error:", error);
  else console.log("Products:", data);
}

addbtn.addEventListener("click", function () {
  const name = prod_Name.value;
  const price = prodPrice.value;
  addProduct(name, price);
  console.log(price, name);
});
fetchProducts();

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
