"use strict";

const modal = document.getElementById("mixtureModal");
const dynamicmodal = document.getElementById("dynamicmodal");
const closeBtn = document.querySelector(".createdMixturesButtonclose");
const modalContent = document.getElementById("createdMixtureModalContent");
const dynamicAlert = document.getElementById("dynamicAlert");
const dynamicBtn = document.getElementById("dynamicBtn");
const auditclosebtn = document.getElementById("auditclosebtn");
const dynamicauditmodal = document.getElementById("dynamicauditmodal");

dynamicBtn.addEventListener("click", function () {
  dynamicmodal.classList.remove(
    "opacity-100",
    "scale-100",
    "pointer-events-auto",
    "bg-opacity-50"
  );
  dynamicmodal.classList.add(
    "opacity-0",
    "scale-95",
    "pointer-events-none",
    "bg-opacity-0"
  );
});

auditclosebtn.addEventListener("click", function () {
  dynamicauditmodal.classList.remove(
    "opacity-100",
    "scale-100",
    "pointer-events-auto",
    "bg-opacity-50"
  );
  dynamicauditmodal.classList.add(
    "opacity-0",
    "scale-95",
    "pointer-events-none",
    "bg-opacity-0"
  );
});
