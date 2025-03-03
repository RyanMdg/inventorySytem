let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  // Create blur effect
  const blurBackground = document.createElement("div");
  blurBackground.style.position = "fixed";
  blurBackground.style.top = "0";
  blurBackground.style.left = "0";
  blurBackground.style.width = "100%";
  blurBackground.style.height = "100%";
  blurBackground.style.backdropFilter = "blur(5px)";
  blurBackground.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  blurBackground.style.zIndex = "999";
  blurBackground.style.display = "flex";
  blurBackground.style.justifyContent = "center";
  blurBackground.style.alignItems = "center";

  // Create modal container
  const modal = document.createElement("div");
  modal.style.background = "white";
  modal.style.padding = "20px";
  modal.style.borderRadius = "10px";
  modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
  modal.style.textAlign = "center";
  modal.style.position = "relative";
  modal.style.width = "300px";

  // Modal title
  const title = document.createElement("h2");
  title.textContent = "Install AFFOTAKO!";
  title.style.marginBottom = "10px";

  // Modal img
  const img = document.createElement("img");
  img.src = "../images/octo.png";
  img.classList.add("w-[5rem]", "flex", "justify-center");

  // Modal message
  const message = document.createElement("p");
  message.textContent =
    "🔥 Install Affotako today and level up your experience!";

  // Install button
  const installBtn = document.createElement("button");
  installBtn.textContent = "Install Now";
  installBtn.style.padding = "10px 20px";
  installBtn.style.background = "#B60205";
  installBtn.style.color = "white";
  installBtn.style.border = "none";
  installBtn.style.borderRadius = "2px";
  installBtn.style.cursor = "pointer";
  installBtn.style.marginTop = "15px";

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.textContent = "✖";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "15px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "18px";

  // Append elements
  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(img);
  modal.appendChild(message);
  modal.appendChild(installBtn);
  blurBackground.appendChild(modal);
  document.body.appendChild(blurBackground);

  // Handle install button click
  installBtn.addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("User installed the app");
      }
      deferredPrompt = null;
      document.body.removeChild(blurBackground);
    });
  });

  // Close modal when clicking outside or pressing "X"
  closeBtn.addEventListener("click", () =>
    document.body.removeChild(blurBackground)
  );
  blurBackground.addEventListener("click", (e) => {
    if (e.target === blurBackground) {
      document.body.removeChild(blurBackground);
    }
  });
});
