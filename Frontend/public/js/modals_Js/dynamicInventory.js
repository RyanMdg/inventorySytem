"strict";
const dynamicAlerts = document.getElementById("dynamicAlert");
const dynamicmodal = document.getElementById("dynamicmodal");
const statusAlert = document.getElementById("status");
const descriptionAlert = document.getElementById("description");

export async function dynamicAlert(status, description) {
  dynamicmodal.classList.add("opacity-100", "scale-100", "bg-opacity-50");
  dynamicmodal.classList.remove("pointer-events-none");

  descriptionAlert.textContent = description;
  statusAlert.textContent = status;
}
