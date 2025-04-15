"use strict";

const modal = document.getElementById("mixtureModal");
const closeBtn = document.querySelector(".createdMixturesButtonclose");
const modalContent = document.getElementById("createdMixtureModalContent");

// Close when clicking the close button
closeBtn.addEventListener("click", function () {
  modal.classList.add("hidden");
});

// Close when clicking outside the modal content
modal.addEventListener("click", function (event) {
  if (!modalContent.contains(event.target)) {
    modal.classList.add("hidden");
  }
});
