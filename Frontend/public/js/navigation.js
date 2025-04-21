"use strict";

const nav = document.querySelector("aside");
const navItems = document.querySelectorAll("aside ul li a");

nav.addEventListener("click", function (event) {
  const target = event.target.closest("a");
  if (!target) return;

  navItems.forEach((link) =>
    link.classList.remove(
      "text-[#ffff]",
      "bg-[#B60205]",
      "rounded-sm",
      "px-7",
      "py-3",
      "opacity-50"
    )
  );

  target.classList.add(
    "text-[#ffff]",
    "bg-[#B60205]",
    "rounded-sm",
    "px-7",
    "py-3"
  );
});
