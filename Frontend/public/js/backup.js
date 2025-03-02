//* ========= ADD PRODUCTS =========

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

//*=========FETCHING PRODUCTS=========
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
