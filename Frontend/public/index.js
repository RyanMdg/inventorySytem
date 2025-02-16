// * show password

const password = document.getElementById("password");
const username = document.getElementById("Username");

const showpass = () => {
  const closeEyes = document.getElementById("eye");
  const openEye = document.getElementById("eyes");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
  closeEyes.classList.toggle("hidden");
  openEye.classList.toggle("hidden");
};

// * login

const login = document.getElementById("loginForm");

login.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userName = username.value;
  const pass = password.value;

  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, pass }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("Login succesful!");
    window.location.href = "pos.html";
  } else {
    alert(data.message);
  }
});
