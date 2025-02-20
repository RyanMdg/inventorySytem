"strict";

const dash = document.querySelector(".dash");

dash.addEventListener("click", function () {
  if ((location.href = "dashboard.html")) {
    dash.classList.add("text-[#B60205]");
    dash.classList.add("bg-[#feebec]");
  }
});
