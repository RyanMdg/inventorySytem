"strict";

const link = document.querySelector(".links");

link.addEventListener("click", function () {
  link.classList.add("text-[#B60205]");
  link.classList.add("bg-[#feebec]");
  location.href = "dashboard.html";
});
