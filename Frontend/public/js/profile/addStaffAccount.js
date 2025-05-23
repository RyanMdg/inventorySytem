"strict";

import { dynamicAlert } from "../modals_Js/dynamicInventory.js";

const addStaff = document.getElementById("addStaff");
const dynamicmodal = document.getElementById("dynamicmodal");
const addNewAcc = document.getElementById("addNewAcc");
const headerTxt = document.getElementById("headerTxt");
const greenCheck = document.getElementById("greenCheck");
const ok_container = document.getElementById("ok_container");
const addStaffCancelBtn = document.getElementById("addStaffCancelBtn");
const quickLogin = document.getElementById("quickLogin");
const quickLoginBtn = document.getElementById("quickLogin_container");

addNewAcc.addEventListener("click", function () {
  dynamicAlert(null, null);
  headerTxt.classList.remove("hidden");
  greenCheck.classList.add("hidden");
  addStaff.classList.remove("hidden");
  ok_container.classList.add("hidden");
  quickLogin.classList.remove("hidden");
  quickLoginBtn.classList.remove("hidden");
});

addStaffCancelBtn.addEventListener("click", function () {
  dynamicmodal.classList.remove("opacity-100");
  dynamicmodal.classList.add("pointer-events-none");

  headerTxt.classList.add("hidden");
  greenCheck.classList.add("hidden");
  addStaff.classList.add("hidden");
  ok_container.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    addStaffCancelBtn.click();
  }
});
