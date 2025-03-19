// * show password

const closedEye = document.querySelector(".eye-icon");
const openEyes = document.querySelector(".eye-icons");

closedEye.addEventListener("click", function () {
  const closeEyes = document.getElementById("eye");
  const openEye = document.getElementById("eyes");
  if (password.type === "password") {
    password.type = "text";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});

openEyes.addEventListener("click", function () {
  const closeEyes = document.getElementById("eye");
  const openEye = document.getElementById("eyes");
  if (password.type === "text") {
    password.type = "password";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
});

// * if user are login
// async function checkUser() {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     window.location.href = "index.html";
//   }
// }

// checkUser();
