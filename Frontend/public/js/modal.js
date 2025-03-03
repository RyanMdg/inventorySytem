"strict";
import supabase from "../Backend2/config/SupabaseClient.js";

const modal_Container = document.getElementById("modal");
const product_Cont = document.querySelector(".productContainer");
const close_Modal = document.querySelector(".close");
const modal_Product_name = document.getElementById("modal_prod_name");
const image_modal = document.getElementById("img_modal");

product_Cont.addEventListener("click", function () {
  const clickedProduct = event.target.closest("[data-product-name]"); // Get the closest product container

  if (clickedProduct) {
    const selectedProductName =
      clickedProduct.getAttribute("data-product-name");

    const selectedProductImage =
      clickedProduct.getAttribute("data-product-img");

    // Store in localStorage
    localStorage.setItem("selectedProductName", selectedProductName);
    localStorage.setItem("selectedProductImage", selectedProductImage);

    // Show modal and update product name
    modal_Container.classList.remove("hidden");
    modal_Product_name.textContent = selectedProductName;
    image_modal.src = selectedProductImage;
  }
});

close_Modal.addEventListener("click", function () {
  modal_Container.classList.toggle("hidden");
});

//  * MODAL SELECTING QUANTITY
const btn_Quantity = document.querySelectorAll(".btnQuantity");
const pcs = document.getElementById("pcs");
const toTal = document.getElementById("total");

btn_Quantity.forEach((button) => {
  button.addEventListener("click", () => {
    btn_Quantity.forEach((btn) => {
      btn.classList.remove("bg-[#B60205]", "text-white");
    });

    button.classList.add("bg-[#B60205]", "text-white");

    pcs.textContent = button.textContent;
    toTal.textContent = `₱${button.dataset.value}`;
  });
});
