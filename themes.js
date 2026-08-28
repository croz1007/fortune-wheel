(() => {
  "use strict";

  const STORAGE_KEY = "friday-wheel-theme-v1";
  const DEFAULT_THEME = "classic";

  const THEMES = Object.freeze([
    Object.freeze({ id: "classic", name: "Classic" }),
    Object.freeze({ id: "midnight", name: "Midnight" }),
    Object.freeze({ id: "chalkboard", name: "Chalkboard" }),
    Object.freeze({ id: "plum", name: "Plum" }),
    Object.freeze({ id: "slate", name: "Slate" }),
    Object.freeze({ id: "carnival", name: "Carnival" }),
    Object.freeze({ id: "gumballs", name: "Gumballs" }),
    Object.freeze({ id: "skittles", name: "Skittles" }),
    Object.freeze({ id: "arcade", name: "Arcade" }),
    Object.freeze({ id: "toybox", name: "Toy Box" })
  ]);

  const VALID_THEME_IDS = new Set(THEMES.map(({ id }) => id));

  function normalizeThemeId(themeId) {
    return VALID_THEME_IDS.has(themeId) ? themeId : DEFAULT_THEME;
  }

  function load() {
    try {
      return normalizeThemeId(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_THEME;
    }
  }

  function apply(themeId, { persist = true } = {}) {
    const normalized = normalizeThemeId(themeId);
    document.documentElement.dataset.theme = normalized;

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        // Theme persistence is optional. The selected theme still applies now.
      }
    }

    return normalized;
  }

  function current() {
    return normalizeThemeId(document.documentElement.dataset.theme);
  }

  // Apply the saved preference immediately so the page does not flash the
  // default theme before app.js initializes.
  apply(load(), { persist: false });

  window.FridayWheelThemes = Object.freeze({
    THEMES,
    DEFAULT_THEME,
    apply,
    current
  });
})();
