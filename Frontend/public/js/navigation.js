"use strict";

const container = document.getElementById("container");
const nav = document.querySelector("nav");
const navItems = document.querySelectorAll("nav ul li a");

const loadPage = (page) => {
  fetch(`../pages/${page}.html`)
    .then((response) => response.text())
    .then((data) => {
      container.innerHTML = data;

      if (page === "pos") {
        const script = document.createElement("script");
        script.src = "../js/pos.js";
        script.defer = true;
        document.body.appendChild(script);
      }
    })
    .catch((error) => console.error("Error loading the file:", error));
};
loadPage("dashboard");

nav.addEventListener("click", function (event) {
  const target = event.target.closest("a");
  if (!target) return;

  navItems.forEach((link) =>
    link.classList.remove(
      "text-[#B60205]",
      "bg-[#feebec]",
      "rounded-sm",
      "px-7",
      "py-3",
      "opacity-50"
    )
  );

  target.classList.add(
    "text-[#B60205]",
    "bg-[#feebec]",
    "rounded-sm",
    "px-7",
    "py-3"
  );

  loadPage(target.id);
});
