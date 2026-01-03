(function () {
  const KEY = "nsfw-consent-accepted";

  const overlay = document.getElementById("nsfw-overlay");
  const acceptBtn = document.getElementById("nsfw-accept");

  if (!overlay || !acceptBtn) return;

  // Check consent
  const accepted = localStorage.getItem(KEY) === "true";

  if (!accepted) {
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(KEY, "true");
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  });
})();

