"strict";

import supabase from "../../Backend2/config/SupabaseClient.js";
import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".submit_product");
const profile_name = document.getElementById("profile_name");
const statusBtn = document.getElementById("statusButton");

//* ========= IMAGE UPLOADS =========

async function uploadImage(file) {
  if (!file) {
    console.error("No file selected!");
    return;
  }

  const fileName = `images/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("affotako") // Ensure this matches your actual bucket name
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  console.log("File uploaded:", data);
  return data.path; // Return the file path
}

function getPublicUrl(filePath) {
  const { data } = supabase.storage.from("affotako").getPublicUrl(filePath);

  if (!data) {
    console.error("Failed to retrieve public URL");
    return null;
  }
  return data.publicUrl; // Return the public URL correctly
}

//* ========= ADD PRODUCTS =========
addbtn.addEventListener("click", async function () {
  const productName = document.getElementById("product_name").value;
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image to upload.");
    return;
  }

  //* Step 1: Upload Image First
  const filePath = await uploadImage(file);

  if (!filePath) {
    alert("Image upload failed. Please try again.");
    return;
  }

  //* Step 2: Get Public URL
  const imageUrl = getPublicUrl(filePath);
  if (!imageUrl) {
    alert("Failed to retrieve image URL.");
    return;
  }

  //* Step 3: Get Logged-in User
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.user) {
    console.error("User not authenticated:", authError?.message);
    alert("You must be logged in to add a product.");
    return;
  }

  const userId = user.user.id; //* logged-in user's ID

  //* Step 4: Get User's Branch ID
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

  //* Step 5: Add Product with the Image URL
  const { data: productData, error: productError } = await supabase
    .from("products_table")
    .insert([
      {
        branch_id: branchId,
        name: productName,
        img_url: imageUrl, // Save the correct URL
      },
    ])
    .select("id")
    .single();

  if (productError) {
    console.error("Error adding product:", productError.message);
    alert("Failed to add product.");
    return;
  }

  alert(`Product "${productName}" added successfully!`);
});

//*=========FETCHING PRODUCTS=========
async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from("products_table")
      .select("name,img_url");

    if (error) {
      console.error("Error fetching products:", error.message);
      return;
    }

    const productList = document.getElementById("takeorderContainer");
    productList.innerHTML = "";

    data.forEach((product) => {
      const item = document.createElement("img");
      const productItem = document.createElement("h1");
      const productItemContainer = document.createElement("div");
      productItemContainer.classList.add(
        "bg-white",
        "rounded-sm",
        "shadow",
        "drop-shadow-sm",
        "items-center",
        "py-5",
        "px-2",
        "text-center",
        "max-[69rem]:h-[10rem]",
        "active:translate-y-1.5"
      );
      item.classList.add("w-[13rem]", "max-[69rem]:w-[8rem]");
      productItem.classList.add("font-medium", "text-[#302D3D]", "text-[1rem]");

      productItem.textContent = product.name;

      // Use a data attribute instead of an ID to store the product name
      productItemContainer.setAttribute("data-product-name", product.name);
      productItemContainer.setAttribute("data-product-img", product.img_url);

      item.src = product.img_url;
      item.alt = `${product.img_url}-photo`;
      productItem.textContent = `${product.name}`;

      productList.appendChild(productItemContainer);
      productItemContainer.appendChild(item);
      productItemContainer.appendChild(productItem);
      productItemContainer.addEventListener("click", () => {
        const selectedProductName =
          productItemContainer.getAttribute("data-product-name");
        const selectedProductImage =
          productItemContainer.getAttribute("data-product-img");

        localStorage.setItem("selectedProductName", selectedProductName);
        localStorage.setItem("selectedProductImage", selectedProductImage);
      });
    });

    console.log("Products:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
}

fetchProducts();

//*=========FETCHING USER=========
async function fetchUser() {
  const { branchId, userId } = await getAuthUserAndBranch();

  const { data: branchData, error: branchError } = await supabase
    .from("users_table")
    .select("name, role")
    .eq("branch_id", branchId)
    .eq("id", userId);

  if (branchError) {
    console.error("Error fetching branch name:", branchError.message);
    return;
  }

  if (!branchData || branchData.length === 0) {
    console.warn("No matching users found for branch ID:", branchId);
    return;
  }

  // const { data: permission, error: permisionError } = await supabase
  //   .from("staff_permissions")
  //   .select("*")
  //   .eq("branch_id", branchId)
  //   .eq("user_id", userId);

  // if (permission) {
  //   console.error("Error fetching branch name:", permission.message);
  //   return;
  // }

  // permission.forEach((perm) => {
  //   if(perm.dashboard_access == false){
  //     document.getElementById("dashboard").classList.toggle("hidden");
  //   }
  //   if(perm.pos_access == false){
  //     document.getElementById("pos").classList.toggle("hidden");
  //   }
  //   if(perm.inventory_access == false){
  //     document.getElementById("inventory").classList.toggle("hidden");
  //   }
  //   if(perm.audit_access == false){
  //     document.getElementById("audit").classList.toggle("hidden");
  //   }
  //   if(perm.franchise_access == false){
  //     document.getElementById("Branch").classList.toggle("hidden");
  //   }
  // });

  branchData.forEach((user) => {
    if (user.role == "Main Branch") {
      const mainPage = document.getElementById("mainPage");
      document.getElementById("branch").classList.toggle("hidden");
      document.getElementById("branchcontent").classList.toggle("hidden");
      document.getElementById("add_prod_container").classList.toggle("hidden");
      document.getElementById("Container").classList.toggle("hidden");
      document.getElementById("registerPage").classList.toggle("hidden");
      document.getElementById("audit_Log").classList.toggle("hidden");
      document
        .getElementById("featuresownercontainer")
        .classList.toggle("hidden");
      profile_name.textContent = user.name;
      document.getElementById("branch-name").textContent = user.name;
      document.getElementById("role").textContent = user.role;

      console.log(user.role, user.name);
    } else if (user.role == "staff") {
      profile_name.textContent = user.name;
      document.getElementById("branch-name").textContent = user.name;
      document.getElementById("role").textContent = user.role;

      console.log(user.role, user.name);
    } else if (user.role == "franchisee") {
      const mainPage = document.getElementById("mainPage");
      document.getElementById("branchcontent").classList.toggle("hidden");
      document.getElementById("Container").classList.toggle("hidden");
      document.getElementById("audit_Log").classList.toggle("hidden");
      profile_name.textContent = user.name;
      document.getElementById("addnewaccstaff").classList.toggle("hidden");
      document.getElementById("branch-name").textContent = user.name;
      document.getElementById("role").textContent = user.role;
    }
    else if (user.role == "admin") {
      const mainPage = document.getElementById("mainPage");
      document.getElementById("branch").classList.toggle("hidden");
      document.getElementById("branchcontent").classList.toggle("hidden");
      document.getElementById("add_prod_container").classList.toggle("hidden");
      document.getElementById("Container").classList.toggle("hidden");
      document.getElementById("registerPage").classList.toggle("hidden");
      document.getElementById("audit_Log").classList.toggle("hidden");
      document
        .getElementById("featuresownercontainer")
        .classList.toggle("hidden");
      profile_name.textContent = user.name;
      document.getElementById("branch-name").textContent = user.name;
      document.getElementById("role").textContent = user.role;
    }
  });
}

fetchUser();

// //*=========ONLINE/OFFLINE FUNCTIONS=========
// statusBtn.addEventListener("click", function () {
//   if (this.textContent === "Offline") {
//     this.textContent = "Online";
//     this.className =
//       "text-[1.5rem] outline-1 uppercase drop-shadow-2xl transition-all shadow outline-[#B60205] text-[#B60205] rounded-3xl px-6 cursor-pointer";
//   } else {
//     this.textContent = "Offline";
//     this.className =
//       "text-[1.5rem] outline-1 uppercase drop-shadow-2xl transition-all shadow outline-[#302D3D] rounded-3xl px-6 cursor-pointer";
//   }
// });
