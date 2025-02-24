"strict";

import supabase from "/Backend2/config/SupabaseClient.js";

console.log("hello pos");

async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) console.error("Error:", error);
  else console.log("Product:", data);
}

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".addBtn");

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
