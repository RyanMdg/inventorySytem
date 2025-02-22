"strict";

const nav_Items = document.querySelectorAll("nav ul li a");
const heading = document.querySelectorAll("section h1");
const posNav = document.querySelector(".nav");
const links = document.querySelector(".take");
const pos_container = document.querySelector(".pos_Container");
const reciept = document.getElementById("receipt");

document.addEventListener("click", function (event) {
  const link = event.target.closest(".nav-link");
  if (!link) return;

  event.preventDefault();
  const page = link.getAttribute("data-page");

  fetch(page)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("content").innerHTML = data;
    })
    .catch((error) => console.error("Error loading page:", error));
});
