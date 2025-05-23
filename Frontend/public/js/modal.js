"strict";
import supabase from "../Backend2/config/SupabaseClient.js";

const modal_Container = document.getElementById("modal");
const product_Cont = document.querySelector(".productContainer");
const close_Modal = document.querySelectorAll(".closed");
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
  }
});

const btn_Quantity = document.querySelectorAll(".btnQuantity");
const pcs = document.getElementById("pcs");
const toTal = document.getElementById("total");
let total = 0;
const add_Ons = document.querySelectorAll(".addOns");
const add_Ons_Container = document.getElementById("AddonContainer");
const totalPrice = document.getElementById("totalPrice");
const selectedAddOns = new Map();
const orders = new Map();

// *==================CLOSE MODAL============================
close_Modal.forEach((closeModal) => {
  closeModal.addEventListener("click", function () {
    modal_Container.classList.add("hidden");

    add_Ons.forEach((remove) => {
      remove.classList.remove("text-[#B60205]", "font-bold", "uppercase");
    });
    selectedAddOns.clear();
    localStorage.setItem("selectedAddons", JSON.stringify([]));

    document
      .querySelectorAll(".addonsName, .addonsPrice    ")
      .forEach((el) => el.remove());

    // localSorage.setItem("total bill", 0);

    totalPrice.textContent = "";
  });
});

// * ============MODAL QUANTITY====================

btn_Quantity.forEach((button) => {
  button.addEventListener("click", () => {
    btn_Quantity.forEach((btn) => {
      btn.classList.remove("bg-[#B60205]", "text-white");
    });

    selectedAddOns.clear();
    localStorage.setItem("selectedAddons", JSON.stringify([]));

    add_Ons.forEach((remove) => {
      remove.classList.remove("text-[#B60205]", "font-bold", "uppercase");
    });

    button.classList.add("bg-[#B60205]", "text-white");

    document
      .querySelectorAll(".addonsName, .addonsPrice")
      .forEach((el) => el.remove());

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

//  * =================MODAL SELECTING ADD ONS======================

// Store selected add-ons

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
  totalPrice.textContent = total;
  localStorage.setItem("total bill", Number(totalPrice.textContent));
}

// *========ADD TO BILL BUTTON================

const addbillButton = document.querySelectorAll(".btnaddtobill");
const productList = document.getElementById("listProducts");
const add_Container = document.getElementById("add_Container");

let receiptNumber = localStorage.getItem("receiptNumber");

if (!receiptNumber) {
  receiptNumber = `REC-${Math.floor(Math.random() * 1000000)}`;
  localStorage.setItem("receiptNumber", receiptNumber);
}

addbillButton.forEach((buttonbill) => {
  buttonbill.addEventListener("click", function () {
    let selectedAddons = JSON.parse(
      localStorage.getItem("selectedAddons") || ""
    );

    pcs.textContent = "";
    toTal.textContent = "";
    totalPrice.textContent = "";

    modal_Container.classList.toggle("hidden");

    const ulcontainer = document.createElement("ul");
    const liContainer = document.createElement("li");
    const pcontainer = document.createElement("p");
    const toppingsP = document.createElement("p");
    const add_subContainer = document.createElement("div");
    const spancontainer = document.createElement("span");
    const prodName = localStorage.getItem("selectedProductName");
    const prodQantity = localStorage.getItem("selectedQuantity");
    const prodTotal = localStorage.getItem("total bill");
    let sum = 0;
    const ons = localStorage.getItem("selectedAddons");
    const addonsArray = ons ? JSON.parse(ons) : []; // Convert string to array

    const formattedString = addonsArray.join(", ").toLowerCase();

    const orderID = Math.floor(Math.random() * 100000000) + 1;

    orders.set(`ORD-${orderID}`, {
      receiptNumber: receiptNumber,
      placeOrder_Name: prodName,
      placeOrder_Qty: prodQantity,
      placeOrder_Tot: prodTotal,
      placeOrder_AddOns: formattedString,
      orderid: `ORD-${orderID}`,
      total: sum,
    });

    orders.forEach((ord) => {
      let price = Number(ord.placeOrder_Tot.replace(/[^0-9.]/g, ""));

      sum += price;
      console.log(ord.total);
    });

    localStorage.setItem("grantotal", sum);

    console.log("Current Orders:", Array.from(orders.values()));

    // orders.clear(); // Clears all orders
    // console.log("Orders cleared:", orders);
    liContainer.classList.add("recieptProdName");
    pcontainer.classList.add("recieptQuantityName");
    spancontainer.classList.add("recieptPriceName");
    toppingsP.classList.add("recieptToppings");

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
    add_subContainer.appendChild(toppingsP);
    productList.appendChild(add_subContainer);

    orders.forEach((ord) => {
      liContainer.textContent = ord.placeOrder_Name;
      pcontainer.textContent = ord.placeOrder_Qty;
      spancontainer.textContent = ord.placeOrder_Tot;

      if (selectedAddons.length > 0) {
        toppingsP.textContent = ord.placeOrder_AddOns;
      } else {
        toppingsP.textContent = "No Add-ons";
      }
    });

    toppingsP.classList.add("ms-5");

    btn_Quantity.forEach((btn) => {
      btn.classList.remove("bg-[#B60205]", "text-white");
    });

    localStorage.removeItem("selectedQuantity");
    localStorage.removeItem("selectedQuantityIndex");

    document
      .querySelectorAll(".addonsName, .addonsPrice")
      .forEach((el) => el.remove());

    add_Ons.forEach((remove) => {
      remove.classList.remove("text-[#B60205]", "font-bold", "uppercase");
    });
    localStorage.setItem("selectedAddons", JSON.stringify([]));

    selectedAddOns.clear();

    const grandTotal = localStorage.getItem("grantotal");
    document.querySelector(".grandTotal").textContent = grandTotal;
  });
});

export default orders;

// Show modal
function showModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

// Hide modal
function hideModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
}

// Initialize modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeBtn = modal?.querySelector('.closed');
    const addToBillBtn = modal?.querySelector('.btnaddtobill');

    // Close modal when clicking outside
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Close modal with close button
    closeBtn?.addEventListener('click', hideModal);

    // Handle add to bill and close
    addToBillBtn?.addEventListener('click', () => {
        // Your existing add to bill logic here
        hideModal();
    });

    // Handle size choices
    const sizeButtons = modal?.querySelectorAll('.btnQuantity');
    sizeButtons?.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all buttons
            sizeButtons.forEach(btn => btn.classList.remove('bg-red-50', 'border-[#B60205]'));
            // Add active state to clicked button
            button.classList.add('bg-red-50', 'border-[#B60205]');
        });
    });

    // Handle add-on choices
    const addonButtons = modal?.querySelectorAll('.addOns');
    addonButtons?.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('bg-red-50');
            button.classList.toggle('border-[#B60205]');
        });
    });
});

// Export functions if needed
export { showModal, hideModal };
