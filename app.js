(() => {
  "use strict";

  const Core = FridayWheelCore;
  const Storage = FridayWheelStorage;
  const Wheel = FridayWheelRenderer;
  const Themes = FridayWheelThemes;
  const VOWEL_COST = 250;
  const SPIN_DURATION_MS = 5250;

  const els = collectElements();
  const state = Storage.load(createDefaultState);

  let rotation = state.rotation || 0;
  let spinning = false;
  let confirmCallback = null;
  let resizeTimer = null;
  let draftPlayers = [];

  initialize();

  function initialize() {
    bindEvents();
    cleanPersistedClassroomData();
    applyWheelRotation();
    drawWheel();
    render();

    window.addEventListener("load", drawWheel);
    window.addEventListener("resize", handleResize);
  }

  function collectElements() {
    const ids = [
      "puzzleBoard", "categoryDisplay", "playedLetters", "currentPlayerHeading",
      "spinResult", "currentValue", "playersList", "letterInput", "guessButton",
      "buyVowelButton", "guessMessage", "spinButton", "wheelCanvas",
      "nextPlayerButton", "solveButton", "revealButton", "newGameButton",
      "newGameDialog", "newGameForm", "newGameCategoryInput", "newGamePhraseInput",
      "newGamePlayerInput", "newGameAddPlayerButton", "newGamePlayersList",
      "newGameSetupMessage", "closeNewGameButton", "cancelNewGameButton",
      "scoreboardButton", "themeButton", "instructionsButton", "wheelSettingsButton", "solveDialog",
      "solveForm", "solveInput", "wheelSettingsDialog", "wheelSettingsForm",
      "wheelValuesInput", "resetWheelButton", "scoreboardDialog", "scoreboardModalBody",
      "closeScoreboardButton", "closeScoreboardButtonBottom", "instructionsDialog",
      "closeInstructionsButton", "closeInstructionsButtonBottom", "themeDialog",
      "closeThemeButton", "closeThemeButtonBottom", "confirmDialog",
      "confirmTitle", "confirmMessage"
    ];

    return Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  }

  function createDefaultState() {
    const wheelSettings = [...Core.DEFAULT_WHEEL_VALUES];
    return {
      puzzle: "",
      category: "",
      guessedLetters: [],
      guessedHits: {},
      revealedAll: false,
      solved: false,
      gameActive: false,
      players: [],
      activePlayerIndex: 0,
      currentSpin: null,
      wheelSettings,
      wheelValues: Core.buildWheel(wheelSettings),
      rotation: 0
    };
  }

  function bindEvents() {
    bindGameSetupEvents();
    bindTurnEvents();
    bindDialogEvents();
    bindSettingsEvents();
    bindScoreboardEvents();
  }

  function bindGameSetupEvents() {
    els.newGameButton.addEventListener("click", openNewGameDialog);
    els.closeNewGameButton.addEventListener("click", () => els.newGameDialog.close());
    els.cancelNewGameButton.addEventListener("click", () => els.newGameDialog.close());
    els.newGameAddPlayerButton.addEventListener("click", addDraftPlayer);
    els.newGameForm.addEventListener("submit", startNewGame);

    els.newGamePlayerInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addDraftPlayer();
    });

    els.newGamePlayersList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-draft-player]");
      if (!button) return;
      draftPlayers = draftPlayers.filter((player) => player.id !== button.dataset.removeDraftPlayer);
      renderDraftPlayers();
    });
  }

  function bindTurnEvents() {
    els.spinButton.addEventListener("click", spinWheel);
    els.guessButton.addEventListener("click", playConsonant);
    els.buyVowelButton.addEventListener("click", buyVowel);
    els.nextPlayerButton.addEventListener("click", manuallyAdvanceTurn);
    els.solveButton.addEventListener("click", openSolveDialog);
    els.solveForm.addEventListener("submit", solvePuzzle);
    els.revealButton.addEventListener("click", revealPuzzle);

    els.letterInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") playConsonant();
    });
  }

  function bindDialogEvents() {
    els.themeButton.addEventListener("click", openThemeDialog);
    els.closeThemeButton.addEventListener("click", () => els.themeDialog.close());
    els.closeThemeButtonBottom.addEventListener("click", () => els.themeDialog.close());
    els.themeDialog.addEventListener("click", handleThemeSelection);

    els.instructionsButton.addEventListener("click", () => els.instructionsDialog.showModal());
    els.closeInstructionsButton.addEventListener("click", () => els.instructionsDialog.close());
    els.closeInstructionsButtonBottom.addEventListener("click", () => els.instructionsDialog.close());

    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.closeDialog)?.close();
      });
    });

    els.confirmDialog.addEventListener("close", () => {
      const shouldRun = els.confirmDialog.returnValue === "default" && confirmCallback;
      const callback = confirmCallback;
      confirmCallback = null;
      if (shouldRun) callback();
    });
  }

  function bindSettingsEvents() {
    els.wheelSettingsButton.addEventListener("click", openWheelSettings);
    els.wheelSettingsForm.addEventListener("submit", saveWheelSettings);
    els.resetWheelButton.addEventListener("click", () => {
      els.wheelValuesInput.value = Core.DEFAULT_WHEEL_VALUES.join("\n");
    });
  }

  function bindScoreboardEvents() {
    els.scoreboardButton.addEventListener("click", openScoreboardModal);
    els.closeScoreboardButton.addEventListener("click", () => els.scoreboardDialog.close());
    els.closeScoreboardButtonBottom.addEventListener("click", () => els.scoreboardDialog.close());
    els.scoreboardDialog.addEventListener("close", restoreScoreboardColumn);

    els.playersList.addEventListener("click", handlePlayerAction);
  }

  function openThemeDialog() {
    syncThemeSelection();
    els.themeDialog.showModal();
  }

  function handleThemeSelection(event) {
    const option = event.target.closest("[data-theme-option]");
    if (!option) return;

    Themes.apply(option.dataset.themeOption);
    syncThemeSelection();
  }

  function syncThemeSelection() {
    const selected = Themes.current();
    els.themeDialog.querySelectorAll("[data-theme-option]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.themeOption === selected));
    });
  }

  // ---------- Game setup ----------

  function openNewGameDialog() {
    draftPlayers = state.players.map((player) => ({ ...player }));
    els.newGameCategoryInput.value = "";
    els.newGamePhraseInput.value = "";
    els.newGamePlayerInput.value = "";
    setSetupMessage("");
    renderDraftPlayers();
    els.newGameDialog.showModal();
    focusSoon(els.newGameCategoryInput);
  }

  function addDraftPlayer() {
    const name = els.newGamePlayerInput.value.trim();
    if (!name) {
      els.newGamePlayerInput.focus();
      return;
    }

    const validation = validateClassroomText(name, "Player name");
    if (!validation.ok) {
      setSetupMessage(validation.message, "bad");
      els.newGamePlayerInput.select();
      return;
    }

    if (draftPlayers.some((player) => player.name.trim().toLowerCase() === name.toLowerCase())) {
      setSetupMessage(`${name} is already in the player list.`, "bad");
      els.newGamePlayerInput.select();
      return;
    }

    draftPlayers.push(Core.createPlayer(name));
    els.newGamePlayerInput.value = "";
    setSetupMessage("");
    renderDraftPlayers();
    els.newGamePlayerInput.focus();
  }

  function startNewGame(event) {
    event.preventDefault();

    const category = els.newGameCategoryInput.value.trim();
    const phrase = els.newGamePhraseInput.value.trim();
    const validation = validateNewGame(category, phrase);
    if (!validation.ok) return;

    finalizeCurrentScores();

    state.players = draftPlayers.map((draft) => {
      const existing = state.players.find((player) => player.id === draft.id);
      return Core.createPlayer(draft.name, {
        id: draft.id,
        score: 0,
        overallScore: existing ? existing.overallScore : draft.overallScore
      });
    });

    resetRound({ category, phrase });
    setMessage("Game created. Spin the wheel to begin.", "good");
    persistAndRender();
    els.newGameDialog.close();
    drawWheel();
    focusSoon(els.letterInput);
  }

  function validateNewGame(category, phrase) {
    if (!category) return failSetup("Enter a topic or category.", els.newGameCategoryInput);
    if (!phrase) return failSetup("Enter the word or phrase for the puzzle.", els.newGamePhraseInput);

    const categoryCheck = validateClassroomText(category, "Topic / category");
    if (!categoryCheck.ok) return failSetup(categoryCheck.message, els.newGameCategoryInput);

    const phraseCheck = validateClassroomText(phrase, "Puzzle");
    if (!phraseCheck.ok) return failSetup(phraseCheck.message, els.newGamePhraseInput);

    if (!draftPlayers.length) return failSetup("Add at least one player.", els.newGamePlayerInput);
    return { ok: true };
  }

  function failSetup(message, element) {
    setSetupMessage(message, "bad");
    element.focus();
    return { ok: false };
  }

  function finalizeCurrentScores() {
    state.players.forEach((player) => {
      player.overallScore = Number(player.overallScore || 0) + Number(player.score || 0);
      player.score = 0;
    });
  }

  function resetRound({ category, phrase }) {
    state.gameActive = true;
    state.category = category;
    state.puzzle = phrase;
    state.guessedLetters = [];
    state.guessedHits = {};
    state.revealedAll = false;
    state.solved = false;
    state.activePlayerIndex = 0;
    state.currentSpin = null;
    state.wheelValues = Core.buildWheel(state.wheelSettings);
    rotation = 0;
    applyWheelRotation();
    Storage.clearSession();
  }

  function renderDraftPlayers() {
    if (!draftPlayers.length) {
      els.newGamePlayersList.innerHTML = '<div class="new-game-empty-players">No players added yet.</div>';
      return;
    }

    els.newGamePlayersList.innerHTML = draftPlayers.map((player) => `
      <div class="new-game-player-row">
        <div>
          <div class="new-game-player-name">${Core.escapeHtml(player.name)}</div>
          <div class="new-game-player-overall">Overall ${Core.formatScore(player.overallScore)}</div>
        </div>
        <button
          class="player-mini-button"
          type="button"
          data-remove-draft-player="${Core.escapeHtml(player.id)}"
        >Remove</button>
      </div>
    `).join("");
  }

  // ---------- Turn flow ----------

  function spinWheel() {
    if (!canPlay() || spinning) return;

    spinning = true;
    state.currentSpin = null;
    setMessage("");
    render();

    rotation = Wheel.planSpin(rotation, state.wheelValues.length);
    applyWheelRotation();

    window.setTimeout(resolveSpin, SPIN_DURATION_MS);
  }

  function resolveSpin() {
    const index = Wheel.indexAtPointer(rotation, state.wheelValues.length);
    const result = state.wheelValues[index];
    const player = activePlayer();

    spinning = false;
    state.currentSpin = result;

    if (result === "BANKRUPT") {
      if (player) player.score = 0;
      setMessage(`${player?.name || "Player"} hit BANKRUPT. Score reset and turn lost.`, "bad");
      advanceTurn();
      state.currentSpin = null;
    } else if (result === "LOSE A TURN") {
      setMessage("Lose a Turn. Turn moves to the next player.", "bad");
      advanceTurn();
      state.currentSpin = null;
    } else {
      setMessage(`Spin landed on ${Core.formatWheelValue(result)}. Play a consonant.`, "good");
    }

    persistAndRender();
    focusSoon(els.letterInput);
  }

  function playConsonant() {
    const letter = readLetter();
    if (!letter) return;

    if (Core.isVowel(letter)) {
      setMessage(`${letter} is a vowel. Use Buy Vowel instead.`, "bad");
      return;
    }

    if (state.currentSpin === null) {
      setMessage("Spin the wheel before playing a consonant.", "bad");
      return;
    }

    playLetter({ letter, scorePerMatch: Number(state.currentSpin), isVowelPurchase: false });
  }

  function buyVowel() {
    const letter = readLetter();
    if (!letter) return;

    if (!Core.isVowel(letter)) {
      setMessage(`${letter} is a consonant. Spin the wheel and use Play Consonant.`, "bad");
      return;
    }

    const player = activePlayer();
    if (player.score < VOWEL_COST) {
      setMessage(`${player.name} needs at least ${VOWEL_COST} points to buy a vowel.`, "bad");
      return;
    }

    player.score -= VOWEL_COST;
    playLetter({ letter, scorePerMatch: 0, isVowelPurchase: true });
  }

  function readLetter() {
    if (!ensurePuzzleAndPlayer() || state.solved) return null;

    const letter = els.letterInput.value.trim().toUpperCase();
    els.letterInput.value = "";

    if (!/^[A-Z]$/.test(letter)) {
      setMessage("Enter one letter from A to Z.", "bad");
      return null;
    }

    if (state.guessedLetters.includes(letter)) {
      setMessage(`${letter} has already been played.`, "bad");
      return null;
    }

    return letter;
  }

  function playLetter({ letter, scorePerMatch, isVowelPurchase }) {
    const matches = Core.countLetter(state.puzzle, letter);
    const player = activePlayer();

    state.guessedLetters.push(letter);
    state.guessedHits[letter] = matches > 0;
    state.currentSpin = null;

    if (matches > 0) {
      if (!isVowelPurchase) player.score += scorePerMatch * matches;
      setMessage(correctLetterMessage(letter, matches, scorePerMatch, isVowelPurchase), "good");

      if (isPuzzleComplete()) {
        state.solved = true;
        state.revealedAll = true;
        setMessage(`${player.name} completed the puzzle!`, "good");
      }
    } else {
      setMessage(missedLetterMessage(letter, isVowelPurchase), "bad");
      advanceTurn();
    }

    persistAndRender();
    focusSoon(els.letterInput);
  }

  function correctLetterMessage(letter, matches, scorePerMatch, isVowelPurchase) {
    const occurrence = `${matches} ${matches === 1 ? "time" : "times"}`;
    if (isVowelPurchase) return `${letter} appears ${occurrence}. ${VOWEL_COST} points deducted.`;
    const points = scorePerMatch * matches;
    return `${letter} appears ${occurrence}: +${Core.formatScore(points)} points.`;
  }

  function missedLetterMessage(letter, isVowelPurchase) {
    return isVowelPurchase
      ? `No ${letter}. ${VOWEL_COST} points deducted and the turn moves on.`
      : `No ${letter}. Turn moves to the next player.`;
  }

  function manuallyAdvanceTurn() {
    if (!state.players.length) return;
    advanceTurn();
    state.currentSpin = null;
    setMessage("Turn moved to the next player.");
    persistAndRender();
  }

  function openSolveDialog() {
    if (!ensurePuzzleAndPlayer()) return;
    els.solveInput.value = "";
    els.solveDialog.showModal();
    focusSoon(els.solveInput);
  }

  function solvePuzzle(event) {
    event.preventDefault();

    const solveText = els.solveInput.value.trim();
    const validation = validateClassroomText(solveText, "Solve attempt");
    if (!validation.ok) {
      setMessage(validation.message, "bad");
      els.solveInput.select();
      return;
    }

    if (Core.normalizePhrase(solveText) === Core.normalizePhrase(state.puzzle)) {
      state.solved = true;
      state.revealedAll = true;
      setMessage(`${activePlayer()?.name || "Player"} solved the puzzle!`, "good");
    } else {
      setMessage("That solve is not correct. Turn moves on.", "bad");
      advanceTurn();
      state.currentSpin = null;
    }

    persistAndRender();
    els.solveDialog.close();
  }

  function revealPuzzle() {
    if (!state.puzzle) return;

    confirmAction("Reveal the puzzle?", "This exposes the full answer immediately.", () => {
      state.revealedAll = true;
      state.solved = true;
      state.currentSpin = null;
      setMessage("Puzzle revealed.", "good");
      persistAndRender();
    });
  }

  function advanceTurn() {
    if (!state.players.length) return;
    state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
  }

  // ---------- Rendering ----------

  function render() {
    renderPuzzle();
    renderPlayedLetters();
    renderPlayers();
    renderTurnInfo();
    renderDisabledState();
  }

  function renderPuzzle() {
    els.categoryDisplay.textContent = state.category || (state.puzzle ? "Puzzle" : "Ready for a puzzle");

    if (!state.puzzle) {
      els.puzzleBoard.innerHTML = '<div class="empty-board-message">Create a new game to load the puzzle.</div>';
      return;
    }

    els.puzzleBoard.innerHTML = state.puzzle
      .trim()
      .split(/\s+/)
      .map(renderPuzzleWord)
      .join("");
  }

  function renderPuzzleWord(word) {
    const chars = [...word].map((char) => {
      if (!/[A-Za-z]/.test(char)) {
        return `<span class="puzzle-char punctuation">${Core.escapeHtml(char)}</span>`;
      }

      const letter = char.toUpperCase();
      const revealed = state.revealedAll || state.guessedLetters.includes(letter);
      return `<span class="puzzle-char ${revealed ? "" : "hidden-letter"}">${Core.escapeHtml(letter)}</span>`;
    }).join("");

    return `<span class="puzzle-word">${chars}</span>`;
  }

  function renderPlayedLetters() {
    if (!state.guessedLetters.length) {
      els.playedLetters.innerHTML = '<span class="muted">None yet</span>';
      return;
    }

    els.playedLetters.innerHTML = state.guessedLetters.map((letter) => `
      <span class="played-letter ${state.guessedHits[letter] ? "hit" : "miss"}">${letter}</span>
    `).join("");
  }

  function renderPlayers() {
    if (!state.players.length) {
      els.playersList.innerHTML = '<div class="empty-state">No players yet.</div>';
      return;
    }

    els.playersList.innerHTML = state.players.map((player, index) => `
      <div class="player-card ${index === state.activePlayerIndex ? "active" : ""}">
        <div class="player-name">${Core.escapeHtml(player.name)}</div>
        <div class="player-score">
          <span class="player-score-current">${Core.formatScore(player.score)}</span>
          <span class="player-score-overall">Overall ${Core.formatScore(player.overallScore)}</span>
        </div>
        <div class="player-actions">
          <button class="player-mini-button" type="button" data-player-action="activate" data-index="${index}">Make Active</button>
          <button class="player-mini-button" type="button" data-player-action="add100" data-index="${index}">+100</button>
          <button class="player-mini-button" type="button" data-player-action="minus100" data-index="${index}">-100</button>
          <button class="player-mini-button" type="button" data-player-action="remove" data-index="${index}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  function renderTurnInfo() {
    const player = activePlayer();
    els.currentPlayerHeading.textContent = player ? `${player.name}'s turn` : "Create a game to begin";

    const display = state.currentSpin ?? "—";
    const formatted = Core.formatWheelValue(display);
    els.currentValue.textContent = formatted;
    els.spinResult.innerHTML = `Spin result: <strong>${Core.escapeHtml(formatted)}</strong>`;
  }

  function renderDisabledState() {
    const noPlayableGame = !state.puzzle || !state.players.length || state.solved;
    els.letterInput.disabled = noPlayableGame || spinning;
    els.guessButton.disabled = noPlayableGame || spinning;
    els.buyVowelButton.disabled = noPlayableGame || spinning;
    els.spinButton.disabled = !state.players.length || state.solved || spinning;
    els.solveButton.disabled = noPlayableGame;
    els.nextPlayerButton.disabled = !state.players.length;
    els.revealButton.disabled = !state.puzzle || state.revealedAll;
  }

  // ---------- Scoreboard ----------

  function handlePlayerAction(event) {
    const button = event.target.closest("[data-player-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const player = state.players[index];
    if (!player) return;

    const actions = {
      activate: () => {
        state.activePlayerIndex = index;
        state.currentSpin = null;
      },
      add100: () => { player.score += 100; },
      minus100: () => { player.score = Math.max(0, player.score - 100); },
      remove: () => removePlayer(index)
    };

    actions[button.dataset.playerAction]?.();
    persistAndRender();
  }

  function removePlayer(index) {
    state.players.splice(index, 1);
    if (!state.players.length || state.activePlayerIndex >= state.players.length) {
      state.activePlayerIndex = 0;
    }
    state.currentSpin = null;
  }

  function openScoreboardModal() {
    const panel = document.querySelector(".players-panel");
    if (panel && !els.scoreboardModalBody.contains(panel)) {
      els.scoreboardModalBody.appendChild(panel);
    }
    els.scoreboardDialog.showModal();
  }

  function restoreScoreboardColumn() {
    const panel = document.querySelector(".players-panel");
    const column = document.querySelector(".scoreboard-column");
    if (panel && column && !column.contains(panel)) column.appendChild(panel);
  }

  // ---------- Wheel settings ----------

  function openWheelSettings() {
    els.wheelValuesInput.value = state.wheelSettings.join("\n");
    els.wheelSettingsDialog.showModal();
  }

  function saveWheelSettings(event) {
    event.preventDefault();
    const parsed = Core.parseWheelValues(els.wheelValuesInput.value);

    if (!parsed.ok) {
      alert(parsed.message);
      return;
    }

    state.wheelSettings = parsed.values;
    state.wheelValues = Core.buildWheel(state.wheelSettings);
    state.currentSpin = null;
    rotation = 0;
    applyWheelRotation();
    persistAndRender();
    drawWheel();
    els.wheelSettingsDialog.close();
  }

  function drawWheel() {
    Wheel.draw(els.wheelCanvas, state.wheelValues, Core.WHEEL_COLORS);
  }

  function applyWheelRotation() {
    els.wheelCanvas.style.transform = `rotate(${rotation}deg)`;
  }

  // ---------- Safety / state helpers ----------

  function validateClassroomText(value, fieldLabel) {
    return window.ClassroomFilter?.isAllowed(value)
      ? { ok: true }
      : { ok: false, message: `${fieldLabel} contains language that is not allowed in classroom mode.` };
  }

  function cleanPersistedClassroomData() {
    const originalCount = state.players.length;
    state.players = state.players.filter((player) => window.ClassroomFilter?.isAllowed(player.name) ?? true);
    let sessionChanged = false;

    if (state.category && !(window.ClassroomFilter?.isAllowed(state.category) ?? true)) {
      state.category = "";
      sessionChanged = true;
    }

    if (state.puzzle && !(window.ClassroomFilter?.isAllowed(state.puzzle) ?? true)) {
      state.puzzle = "";
      state.guessedLetters = [];
      state.guessedHits = {};
      state.revealedAll = false;
      state.solved = false;
      state.currentSpin = null;
      sessionChanged = true;
    }

    if (!state.players.length || state.activePlayerIndex >= state.players.length) {
      state.activePlayerIndex = 0;
    }

    if (state.players.length !== originalCount) Storage.savePlayers(state);
    if (sessionChanged) Storage.saveSession(state, rotation);
  }

  function activePlayer() {
    return state.players[state.activePlayerIndex] || null;
  }

  function canPlay() {
    return Boolean(state.puzzle && state.players.length && !state.solved);
  }

  function ensurePuzzleAndPlayer() {
    if (!state.puzzle) {
      setMessage("Create a new game first.", "bad");
      return false;
    }
    if (!state.players.length) {
      setMessage("Create a game with at least one player first.", "bad");
      return false;
    }
    return true;
  }

  function isPuzzleComplete() {
    return ![...state.puzzle.toUpperCase()]
      .filter((char) => /[A-Z]/.test(char))
      .some((char) => !state.guessedLetters.includes(char));
  }

  function persistAndRender() {
    Storage.save(state, rotation);
    render();
  }

  function setMessage(message, tone = "") {
    els.guessMessage.textContent = message;
    els.guessMessage.className = `guess-message ${tone}`.trim();
  }

  function setSetupMessage(message, tone = "") {
    els.newGameSetupMessage.textContent = message;
    els.newGameSetupMessage.className = `guess-message ${tone}`.trim();
  }

  function focusSoon(element) {
    window.setTimeout(() => element?.focus(), 30);
  }

  function confirmAction(title, message, callback) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    confirmCallback = callback;
    els.confirmDialog.showModal();
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(drawWheel, 120);
  }
})();
