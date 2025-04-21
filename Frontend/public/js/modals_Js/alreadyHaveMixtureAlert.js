"use strict";

const modal = document.getElementById("mixtureModal");
const closeBtn = document.querySelector(".createdMixturesButtonclose");
const modalContent = document.getElementById("createdMixtureModalContent");

// Close when clicking the close button
closeBtn.addEventListener("click", function () {
  modal.classList.remove(
    "opacity-100",
    "scale-100",
    "pointer-events-auto",
    "bg-opacity-50"
  );
  modal.classList.add(
    "opacity-0",
    "scale-95",
    "pointer-events-none",
    "bg-opacity-0"
  );
});

// Close when clicking outside the modal content
modal.addEventListener("click", function (event) {
  if (!modalContent.contains(event.target)) {
    modal.classList.remove(
      "opacity-100",
      "scale-100",
      "pointer-events-auto",
      "bg-opacity-50"
    );
    modal.classList.add(
      "opacity-0",
      "scale-95",
      "pointer-events-none",
      "bg-opacity-0"
    );
  }
});
