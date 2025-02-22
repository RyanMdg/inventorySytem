"strict";

document.addEventListener("click", function (event) {
  const link = event.target.closest(".nav-link");
  if (!link) return;
  const heading = document.getElementById("header");

  event.preventDefault();
  const page = link.getAttribute("data-page");
  let result = page.replace(".html", "");
  console.log(result);
  heading.textContent = result;
  fetch(page)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("content").innerHTML = data;
    })
    .catch((error) => console.error("Error loading page:", error));
});

console.log("hello pos");
