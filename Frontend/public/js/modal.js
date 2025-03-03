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

// * MODAL QUANTITY
const btn_Quantity = document.querySelectorAll(".btnQuantity");
const pcs = document.getElementById("pcs");
const toTal = document.getElementById("total");
let total = 0;

btn_Quantity.forEach((button) => {
  button.addEventListener("click", () => {
    btn_Quantity.forEach((btn) => {
      btn.classList.remove("bg-[#B60205]", "text-white");
    });

    button.classList.add("bg-[#B60205]", "text-white");

    total = Number(button.dataset.value); // Reset total to selected value
    pcs.textContent = button.textContent;
    toTal.textContent = button.dataset.value;
    updateTotal();
  });
});

//  * MODAL SELECTING ADD ONS
const add_Ons = document.querySelectorAll(".addOns");
const add_Ons_Container = document.getElementById("AddonContainer");
const totalPrice = document.getElementById("totalPrice");
const selectedAddOns = new Map(); // Store selected add-ons

add_Ons.forEach((add) => {
  add.addEventListener("click", () => {
    const addValue = Number(add.dataset.value);
    const addText = add.textContent;

    if (selectedAddOns.has(addText)) {
      // Remove add-on from total and container
      total -= addValue;
      selectedAddOns.get(addText).remove();
      selectedAddOns.delete(addText);
      add.classList.remove("text-[#B60205]", "font-bold", "uppercase");
    } else {
      // Add add-on to total and container
      total += addValue;
      const container = document.createElement("div");
      const addtext = document.createElement("p");
      const addprice = document.createElement("span");

      addtext.textContent = addText;
      addprice.textContent = `₱${addValue}`;

      container.appendChild(addtext);
      container.appendChild(addprice);
      container.classList.add("flex", "justify-between");

      add_Ons_Container.appendChild(container);
      selectedAddOns.set(addText, container);

      add.classList.add("text-[#B60205]", "font-bold", "uppercase");
    }
    updateTotal();
  });
});

function updateTotal() {
  totalPrice.textContent = `₱${total}`;
}
