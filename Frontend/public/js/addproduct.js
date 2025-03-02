"strict";

import supabase from "../Backend2/config/SupabaseClient.js";

const prod_Name = document.querySelector(".productName");
const prodPrice = document.querySelector(".productprice");
const addbtn = document.querySelector(".submit_product");
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
        "text-center"
      );
      item.classList.add("w-[13rem]");
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
  //* logged-in user
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

  if (branchData.role == "Owner") {
    const branchContainer = document.getElementById("branch");
    const addProdContainer = document.getElementById("add_prod_container");
    const branch_Content = document.getElementById("branchcontent");
    branchContainer.classList.toggle("hidden");
    branch_Content.classList.toggle("hidden");
    addProdContainer.classList.toggle("hidden");
  }

  console.log("Branch Name:", branchData.name);

  document.getElementById("branch-name").textContent = branchData.name;
  document.getElementById("role").textContent = branchData.role;
  console.log(branchData.role, branchData.name);
}

fetchUser();

//*=========ONLINE/OFFLINE FUNCTIONS=========
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
