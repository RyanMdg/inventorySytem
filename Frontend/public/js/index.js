// * show password

const passwords = document.getElementById("password");
const usernames = document.getElementById("Username");
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
// * login

const login = document.getElementById("loginForm");

login.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = usernames.value;
  const password = passwords.value;
  console.log(username, password);

  const res = await fetch(
    "https://inventorysytem.onrender.com/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }
  );

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("Login succesful!");

    window.location.href = "../pages/pos.html";
  } else {
    alert(data.message);
  }
});
