/* Comic reader display modes + sticky toolbar behavior
   Modes:
     - normal: desktop-friendly (slightly narrower)
     - fit-width: full width
     - fit-height: constrain each page to viewport height

   UX:
     - toolbar top offset follows visible site topbar height
     - toolbar becomes compact after scrolling a bit
*/

(function () {
  const STORAGE_KEY = "comicReaderMode";
  const DEFAULT_MODE = "normal";

  function setActiveButton(controlsEl, mode) {
    if (!controlsEl) return;
    controlsEl.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-mode") === mode);
    });
  }

  function applyMode(readerEl, controlsEl, mode) {
    if (!readerEl) return;
    readerEl.setAttribute("data-mode", mode);
    setActiveButton(controlsEl, mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const readerEl = document.querySelector(".reader");
    if (!readerEl) return;

    const controlsEl = document.querySelector(".reader-controls");
    const toolbarEl = document.querySelector(".toolbar-top");
    const headerEl = document.querySelector(".topbar"); // site header

    // --- restore mode
    let saved = DEFAULT_MODE;
    try {
      saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
    } catch (_) {}
    if (!["normal", "fit-width", "fit-height"].includes(saved)) saved = DEFAULT_MODE;
    applyMode(readerEl, controlsEl, saved);

    // --- buttons
    if (controlsEl) {
      controlsEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-mode]");
        if (!btn) return;
        e.preventDefault();
        const mode = btn.getAttribute("data-mode");
        applyMode(readerEl, controlsEl, mode);
      });
    }

    // --- keyboard shortcuts: 1/2/3
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      const tag = (t && t.tagName) ? t.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "1") applyMode(readerEl, controlsEl, "normal");
      if (e.key === "2") applyMode(readerEl, controlsEl, "fit-width");
      if (e.key === "3") applyMode(readerEl, controlsEl, "fit-height");
    });

    // --- dynamic top offset: follow visible height of the topbar
    // This prevents the "floating toolbar" when the header disappears.
    function updateHeaderVisibleHeight() {
      let visible = 0;

      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        // rect.bottom is how far (in px) the bottom of header is from viewport top.
        // If header is fully visible and sticky, rect.bottom ≈ header height.
        // If header is gone, rect.bottom <= 0.
        visible = clamp(rect.bottom, 0, headerEl.offsetHeight);
      }

      document.documentElement.style.setProperty("--header-visible", visible + "px");
    }

    // --- compact toolbar on scroll
    function updateCompact() {
      if (!toolbarEl) return;
      const y = window.scrollY || 0;
      if (y > 90) toolbarEl.classList.add("is-compact");
      else toolbarEl.classList.remove("is-compact");
    }

    // Initial update
    updateHeaderVisibleHeight();
    updateCompact();

    // Scroll/resize updates (passive for perf)
    window.addEventListener("scroll", () => {
      updateHeaderVisibleHeight();
      updateCompact();
    }, { passive: true });

    window.addEventListener("resize", () => {
      updateHeaderVisibleHeight();
      updateCompact();
    }, { passive: true });
  });
})();

