"strict";
import supabase from "../Backend2/config/SupabaseClient.js";

const modal_Container = document.getElementById("modal");
const product_Cont = document.querySelector(".productContainer");
const close_Modal = document.querySelectorAll(".close");
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

close_Modal.forEach((closeModal) => {
  closeModal.addEventListener("click", function () {
    modal_Container.classList.toggle("hidden");
  });
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
    localStorage.setItem("quantityPrice", toTal.textContent);

    button.setAttribute("data-product-quantity", button.textContent);
    const selectedQuantity = button.getAttribute("data-product-quantity");
    localStorage.setItem("selectedQuantity", selectedQuantity);
    localStorage.setItem(
      "selectedQuantityIndex",
      [...btn_Quantity].indexOf(button)
    );
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
    const storedPcs = localStorage.getItem("selectedQuantity");
    const addText = add.textContent;

    let selectedAddons = JSON.parse(
      localStorage.getItem("selectedAddons") || "[]"
    );

    if (selectedAddOns.has(addText)) {
      total -= addValue;
      selectedAddOns.get(addText).remove();
      selectedAddOns.delete(addText);
      add.classList.remove("text-[#B60205]", "font-bold", "uppercase");

      selectedAddons = selectedAddons.filter((item) => item !== addText);
    } else {
      total += addValue;
      const container = document.createElement("div");
      const addtext = document.createElement("p");
      const addprice = document.createElement("span");
      addtext.classList.add("addonsName");
      addprice.classList.add("addonsPrice");
      addtext.textContent = addText;
      addprice.textContent = `₱${addValue}`;

      container.appendChild(addtext);
      container.appendChild(addprice);
      container.classList.add("flex", "justify-between");

      add_Ons_Container.appendChild(container);
      selectedAddOns.set(addText, container);

      add.classList.add("text-[#B60205]", "font-bold", "uppercase");
      selectedAddons.push(addText);
    }
    localStorage.setItem("selectedAddons", JSON.stringify(selectedAddons));
    updateTotal();
  });
});

function updateTotal() {
  totalPrice.textContent = `₱${total}`;
  localStorage.setItem("total bill", totalPrice.textContent);
}

const addbillButton = document.querySelectorAll(".btnaddtobill");
const productList = document.getElementById("listProducts");
const add_Container = document.getElementById("add_Container");
addbillButton.forEach((buttonbill) => {
  buttonbill.addEventListener("click", function () {
    let selectedAddons = JSON.parse(
      localStorage.getItem("selectedAddons") || "[]"
    );
    selectedAddOns.clear();
    pcs.textContent = "";
    toTal.textContent = "";
    totalPrice.textContent = "";

    const ulcontainer = document.createElement("ul");
    const liContainer = document.createElement("li");
    const pcontainer = document.createElement("p");
    const toppingsP = document.createElement("p");
    const spancontainer = document.createElement("span");
    const prodName = localStorage.getItem("selectedProductName");
    const prodQantity = localStorage.getItem("selectedQuantity");
    const prodTotal = localStorage.getItem("total bill");

    ulcontainer.classList.add(
      "text-[1.1rem]",
      "flex",
      "justify-between",
      "mt-2"
    );

    liContainer.classList.add("ps-[1.2rem]");
    spancontainer.classList.add("pe-[4.2rem]");

    productList.appendChild(ulcontainer);
    ulcontainer.appendChild(liContainer);
    ulcontainer.appendChild(pcontainer);
    ulcontainer.appendChild(spancontainer);
    add_Container.appendChild(toppingsP);

    liContainer.textContent = prodName;
    pcontainer.textContent = prodQantity;
    spancontainer.textContent = prodTotal;

    if (selectedAddons.length > 0) {
      toppingsP.textContent = selectedAddons.join(", ");
    } else {
      toppingsP.textContent = "No Add-ons";
    }

    btn_Quantity.forEach((btn) => {
      btn.classList.remove("bg-[#B60205]", "text-white");
    });

    localStorage.removeItem("selectedQuantity");
    localStorage.removeItem("selectedQuantityIndex");
    localStorage.setItem("selectedAddons", JSON.stringify([]));

    document
      .querySelectorAll(".addonsName, .addonsPrice")
      .forEach((el) => el.remove());

    add_Ons.forEach((remove) => {
      remove.classList.remove("text-[#B60205]", "font-bold", "uppercase");
    });
  });
});
