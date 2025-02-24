"strict";

// document.addEventListener("click", function (event) {
//   const link = event.target.closest(".nav-link");
//   if (!link) return;
//   const heading = document.getElementById("header");

//   event.preventDefault();
//   const page = link.getAttribute("data-page");
//   let result = page.replace(".html", "");
//   console.log(result);
//   heading.textContent = result;
//   fetch(page)
//     .then((response) => response.text())
//     .then((data) => {
//       document.getElementById("content").innerHTML = data;
//     })
//     .catch((error) => console.error("Error loading page:", error));
// });

const togo = document.getElementById("togo");
const del = document.getElementById("del");
const cash = document.getElementById("cash");
const gcash = document.getElementById("gcash");
const bank = document.getElementById("bank");

function toggleButtons(active, inactive) {
  active.classList.add("bg-[#B60205]", "text-white");
  active.classList.remove("bg-[#EAEEF7]");

  inactive.classList.add("bg-[#EAEEF7]");
  inactive.classList.remove("bg-[#B60205]", "text-white");
}

togo.addEventListener("click", () => toggleButtons(togo, del));
del.addEventListener("click", () => toggleButtons(del, togo));
cash.addEventListener("click", () => toggleButtons(cash, gcash));
cash.addEventListener("click", () => toggleButtons(cash, bank));
gcash.addEventListener("click", () => toggleButtons(gcash, cash));
gcash.addEventListener("click", () => toggleButtons(gcash, bank));
bank.addEventListener("click", () => toggleButtons(bank, gcash));
bank.addEventListener("click", () => toggleButtons(bank, cash));

console.log("hello pos");

// * database
