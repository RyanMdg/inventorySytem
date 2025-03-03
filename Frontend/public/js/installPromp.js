let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  // Show a custom install button
  const installBtn = document.createElement("button");
  installBtn.textContent = "Install App";
  installBtn.style.position = "fixed";
  installBtn.style.bottom = "20px";
  installBtn.style.right = "20px";
  installBtn.style.padding = "10px";
  installBtn.style.background = "#007BFF";
  installBtn.style.color = "white";
  installBtn.style.border = "none";
  installBtn.style.cursor = "pointer";

  document.body.appendChild(installBtn);

  installBtn.addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("User installed the app");
      }
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  });
});
