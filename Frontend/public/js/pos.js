"strict";

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
