(() => {
  "use strict";

  const PLAYER_STORAGE_KEY = "friday-wheel-players-v1";
  const SESSION_STORAGE_KEY = "friday-wheel-session-v1";

  function load(createDefaultState) {
    const state = createDefaultState();
    loadPlayers(state);
    loadSession(state);

    if (!state.players.length || state.activePlayerIndex >= state.players.length) {
      state.activePlayerIndex = 0;
    }

    return state;
  }

  function loadPlayers(state) {
    try {
      const raw = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || "[]");
      if (!Array.isArray(raw)) return;

      state.players = raw.map((player) => FridayWheelCore.createPlayer(player.name, player));
    } catch {
      state.players = [];
    }
  }

  function loadSession(state) {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
      if (!session || typeof session !== "object") return;

      state.puzzle = session.puzzle || "";
      state.category = session.category || "";
      state.guessedLetters = Array.isArray(session.guessedLetters) ? session.guessedLetters : [];
      state.guessedHits = isPlainObject(session.guessedHits) ? session.guessedHits : {};
      state.revealedAll = Boolean(session.revealedAll);
      state.solved = Boolean(session.solved);
      state.gameActive = Boolean(session.gameActive);
      state.activePlayerIndex = Number.isInteger(session.activePlayerIndex) ? session.activePlayerIndex : 0;
      state.currentSpin = session.currentSpin ?? null;
      state.wheelSettings = Array.isArray(session.wheelSettings) && session.wheelSettings.length
        ? session.wheelSettings
        : [...FridayWheelCore.DEFAULT_WHEEL_VALUES];
      state.wheelValues = Array.isArray(session.wheelValues) && session.wheelValues.length >= 8
        ? session.wheelValues
        : FridayWheelCore.buildWheel(state.wheelSettings);
      state.rotation = Number(session.rotation || 0);
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  function savePlayers(state) {
    const players = state.players.map(({ id, name, score, overallScore }) => ({
      id,
      name,
      score: Number(score || 0),
      overallScore: Number(overallScore || 0)
    }));

    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(players));
  }

  function saveSession(state, rotation) {
    const session = {
      puzzle: state.puzzle,
      category: state.category,
      guessedLetters: state.guessedLetters,
      guessedHits: state.guessedHits,
      revealedAll: state.revealedAll,
      solved: state.solved,
      gameActive: state.gameActive,
      activePlayerIndex: state.activePlayerIndex,
      currentSpin: state.currentSpin,
      wheelSettings: state.wheelSettings,
      wheelValues: state.wheelValues,
      rotation
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  function save(state, rotation) {
    savePlayers(state);
    saveSession(state, rotation);
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  window.FridayWheelStorage = Object.freeze({
    load,
    save,
    savePlayers,
    saveSession,
    clearSession
  });
})();
