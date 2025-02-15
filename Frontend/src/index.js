// * Main frontend logic

const password = document.getElementById("password");

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
