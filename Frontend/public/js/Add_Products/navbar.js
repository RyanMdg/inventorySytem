const hidereciept = document.querySelectorAll(".actionhidereciept");
const reciept = document.querySelector(".reciept");
const mainreciept = document.getElementById("mainreciept");
let removedreciept;

hidereciept.forEach((btn) => {
  btn.addEventListener("click", () => {
    mainreciept.classList.add("hidden");
  });
});

reciept.addEventListener("click", function () {
  mainreciept.classList.remove("hidden");
});
