"strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".submit_product");
const statusBtn = document.getElementById("statusButton");

console.log("hello pos");

//* ADD PRODUCTS
// async function addProduct(branch_Id, product_Name, product_Price) {
//   // Step 1: Insert Product into the 'products_table'
//   const { data, error } = await supabase
//     .from("products_table")
//     .insert([
//       { branch_id: branch_Id, name: product_Name, price: product_Price },
//     ])
//     .select("id")
//     .single(); // Get the first row directly

//   if (error) {
//     console.error("Error adding product:", error.message);
//     return;
//   }

//   const productId = data.id; // Get the newly created product ID

//   console.log(
//     `Product added with ID: ${productId} for Branch ID: ${branch_Id}`
//   );
//   alert(
//     `Product "${product_Name}" added successfully for Branch ID: ${branch_Id}`
//   );
// }

addbtn.addEventListener("click", async function () {
  const productName = document.getElementById("product_name").value;
  const productPrice = document.getElementById("product_price").value;

  // * logged-in user
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to add a product.");
    return;
  }

  const userId = user.user.id; //* logged-in user's ID

  // * branch ID of the user
  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single(); //* Get the branch_id

  if (userError || !userData) {
    console.error("Error fetching branch ID:", userError?.message);
    alert("Could not retrieve branch details.");
    return;
  }

  const branchId = userData.branch_id; // * Extract branch ID

  // * Add Product for the User's Branch
  const { data: productData, error: productError } = await supabase
    .from("products_table")
    .insert([{ branch_id: branchId, name: productName, price: productPrice }])
    .select("id")
    .single();

  if (productError) {
    console.error("Error adding product:", productError.message);
    alert("Failed to add product.");
    return;
  }

  console.log(
    `Product added with ID: ${productData.id} for Branch ID: ${branchId}`
  );
  alert(`Product "${productName}" added successfully to your branch!`);
});

//*fethching products

async function fetchProducts() {
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to view products.");
    return;
  }

  const userId = user.user.id;

  const { data: userData, error: userError } = await supabase
    .from("users_table")
    .select("branch_id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching branch ID:", userError?.message);
    alert("Could not retrieve branch details.");
    return;
  }

  const branchId = userData.branch_id;

  const { data: products, error: productError } = await supabase
    .from("products_table")
    .select("name, price")
    .eq("branch_id", branchId);

  if (productError) {
    console.error("Error fetching products:", productError.message);
    alert("Failed to load products.");
    return;
  }

  const productList = document.getElementById("takeorderContainer");
  productList.innerHTML = "";

  products.forEach((product) => {
    const productItem = document.createElement("p");
    const item = document.createElement("p");
    productItem.textContent = `${product.name}`;
    item.textContent = `${product.price}`;
    productList.appendChild(productItem);
    productList.appendChild(item);
  });

  console.log("Products loaded:", products);
}

fetchProducts();

//* fetching user
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
    .select("name, role")
    .eq("id", branchId)
    .single();

  if (branchError) {
    console.error("Error fetching branch name:", branchError.message);
    return;
  }

  console.log("Branch Name:", branchData.name);

  document.getElementById("branch-name").textContent = branchData.name;
  document.getElementById("role").textContent = branchData.role;
  console.log(branchData.role, branchData.name);
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
