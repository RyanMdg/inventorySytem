"strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".submit_product");
const statusBtn = document.getElementById("statusButton");

console.log("hello pos");

async function fetchProducts() {
  const { data, error } = await supabase.from("products_table").select("*");
  if (error) console.error("Error:", error);
  else console.log("Product:", data);

  data.forEach((product, index) => {
    let newParagraph = document.createElement("p");
    let newSpan = document.createElement("span");
    const div = document.createElement("div");
    div.id = `myDiv-${index}`;
    newParagraph.textContent = product.name;
    newSpan.textContent = `₱ ${product.price}`;

    div.appendChild(newParagraph);
    div.appendChild(newSpan);
    document.getElementById("takeorderContainer").appendChild(div);
    div.classList.add("flex", "gap-5", "cursor-pointer", "px-10", "py-3");
  });
}

async function addProduct(branch_id, product_name, product_price) {
  const { data, error } = await supabase
    .from("products_table")
    .insert([
      {
        branch_id: branch_id,
        name: product_name,
        price: product_price,
      },
    ])
    .select(); // This ensures the inserted row is returned

  if (error) {
    console.error("Error adding product:", error);
  } else {
    console.log("Product added successfully:", data);
    alert("Product added successfully");
  }
}

addbtn.addEventListener("click", function () {
  let name = prod_Name.value;
  let price = prodPrice.value;
  addProduct("a461cca5-f270-41cc-86fc-b86b633eba07", name, price);
  console.log(price, name);
  name = "";
  price = "";
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
