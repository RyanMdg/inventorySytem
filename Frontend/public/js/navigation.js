"strict";

const dashboard = document.getElementById("dashboard");
const dash_container = document.getElementById("dash_Container");
const pos = document.getElementById("pos");
const container = document.getElementById("Container");
const inventory = document.getElementById("inventory");
const branch = document.getElementById("Branch");

fetch("dashboard.html")
  .then((response) => response.text()) // Get response as text
  .then((data) => {
    const container = document.getElementById("container");
    container.innerHTML = data;
  })
  .catch((error) => console.error("Error loading the file:", error));

dashboard.addEventListener("click", function () {
  fetch("dashboard.html")
    .then((response) => response.text()) // Get response as text
    .then((data) => {
      const container = document.getElementById("container");
      container.innerHTML = data;
    })
    .catch((error) => console.error("Error loading the file:", error));
});

pos.addEventListener("click", function () {
  fetch("pos.html")
    .then((response) => response.text()) // Get response as text
    .then((data) => {
      const container = document.getElementById("container");
      container.innerHTML = data;
    })
    .catch((error) => console.error("Error loading the file:", error));
});

inventory.addEventListener("click", function () {
  fetch("inventory.html")
    .then((response) => response.text()) // Get response as text
    .then((data) => {
      const container = document.getElementById("container");
      container.innerHTML = data;
    })
    .catch((error) => console.error("Error loading the file:", error));
});

branch.addEventListener("click", function () {
  fetch("branches.html")
    .then((response) => response.text()) // Get response as text
    .then((data) => {
      const container = document.getElementById("container");
      container.innerHTML = data;
    })
    .catch((error) => console.error("Error loading the file:", error));
});
