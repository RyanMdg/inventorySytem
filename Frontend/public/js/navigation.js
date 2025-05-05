"use strict";

const nav = document.querySelector("aside");
const navItems = document.querySelectorAll("aside ul li a");
const ProfileDropdown = document.getElementById("ProfileDropdown");
const profileBtn = document.getElementById("profileBtn");

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

// Toggle dropdown
profileBtn.onclick = (event) => {
  event.stopPropagation();

  const isVisible = ProfileDropdown.classList.contains("opacity-100");

  if (isVisible) {
    // Hide dropdown
    ProfileDropdown.classList.add(
      "translate-y-[-10px]",
      "opacity-0",
      "pointer-events-none"
    );
    ProfileDropdown.classList.remove(
      "translate-y-0",
      "opacity-100",
      "pointer-events-auto"
    );
  } else {
    // Show dropdown
    ProfileDropdown.classList.remove(
      "translate-y-[-10px]",
      "opacity-0",
      "pointer-events-none"
    );
    ProfileDropdown.classList.add(
      "translate-y-0",
      "opacity-100",
      "pointer-events-auto"
    );
  }
};

document.addEventListener("click", (event) => {
  if (
    !notificationBtn.contains(event.target) &&
    !ProfileDropdown.contains(event.target)
  ) {
    ProfileDropdown.classList.add(
      "translate-y-[-10px]",
      "opacity-0",
      "pointer-events-none"
    );
    ProfileDropdown.classList.remove(
      "translate-y-0",
      "opacity-100",
      "pointer-events-auto"
    );
  }
});
