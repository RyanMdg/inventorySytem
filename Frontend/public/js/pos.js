"strict";

const nav_Items = document.querySelectorAll("nav-link");
const heading = document.querySelectorAll("section h1");
const posNav = document.querySelector(".posnav");
const links = document.querySelector(".take");
const pos_container = document.querySelector(".pos_Container");
const reciept = document.getElementById("receipt");

const element1 = document.getElementById("id1");
const element2 = document.getElementById("id2");
const element3 = document.getElementById("id3");
const element4 = document.getElementById("id4");
const element5 = document.getElementById("id5");

const ids = ["id1", "id2", "id3", "id4", "id5"];

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

posNav.addEventListener("click", function (event) {
  const target = event.target.closest("a");
  if (!target) return;

  ids.forEach((id) => {
    document.getElementById(id).classList.remove("text-[#B60205]");
  });

  target.classList.add("text-[#B60205]");
});
