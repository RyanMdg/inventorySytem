document.addEventListener("DOMContentLoaded", () => {
  const togo = document.getElementById("togo");
  const del = document.getElementById("del");
  const cash = document.getElementById("cash");
  const gcash = document.getElementById("gcash");
  const bank = document.getElementById("bank");
  const delivery = document.querySelector(".delmethod");

  function toggleButtons(active, inactive) {
    active.classList.add("bg-[#B60205]", "text-white");
    active.classList.remove("bg-[#EAEEF7]");

    inactive.classList.add("bg-[#EAEEF7]");
    inactive.classList.remove("bg-[#B60205]", "text-white");
  }

  togo.addEventListener("click", () => {
    localStorage.setItem("pickupMethod", "To Go");

    toggleButtons(togo, del);
  });

  del.addEventListener("click", () => {
    localStorage.setItem("pickupMethod", "Delivery");
    toggleButtons(del, togo);
  });

  cash.addEventListener("click", () => {
    localStorage.setItem("paymentMethod", "Cash");
    toggleButtons(cash, gcash);
    toggleButtons(cash, bank);
  });

  gcash.addEventListener("click", () => {
    localStorage.setItem("paymentMethod", "Gcash");
    toggleButtons(gcash, cash);
    toggleButtons(gcash, bank);
  });

  bank.addEventListener("click", () => {
    localStorage.setItem("paymentMethod", "Bank");
    toggleButtons(bank, gcash);
    toggleButtons(bank, cash);
  });
});
