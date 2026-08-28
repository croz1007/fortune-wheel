(() => {
  "use strict";

  const DEFAULT_WHEEL_VALUES = [
    "500", "600", "650", "700", "750", "800", "850", "900", "1000", "1200"
  ];

  const WHEEL_COLORS = [
    "#d55b4a", "#d39d38", "#6d9e63", "#4c83a7",
    "#805a9d", "#c96c34", "#65708a", "#b04f75",
    "#558d88", "#a98542", "#7866a2", "#517e62"
  ];

  const VOWELS = new Set(["A", "E", "I", "O", "U"]);
  const SPECIAL_SEGMENTS = ["BANKRUPT", "BANKRUPT", "LOSE A TURN", "LOSE A TURN"];
  const MINIMUM_SPECIAL_DISTANCE = 3; // Two normal spaces between specials.

  function createId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  function createPlayer(name, overrides = {}) {
    return {
      id: overrides.id || createId(),
      name: String(name || "Player"),
      score: Number(overrides.score || 0),
      overallScore: Number(overrides.overallScore || 0)
    };
  }

  function isVowel(letter) {
    return VOWELS.has(letter);
  }

  function normalizePhrase(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function countLetter(puzzle, letter) {
    const upper = String(puzzle ?? "").toUpperCase();
    return [...upper].filter((char) => char === letter).length;
  }

  function parseWheelValues(raw) {
    const entries = String(raw ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!entries.length) {
      return invalidWheel("Enter at least four numeric point values.");
    }

    const values = [];
    const seen = new Set();

    for (const entry of entries) {
      const upper = entry.toUpperCase();
      if (upper === "BANKRUPT" || upper === "LOSE A TURN") {
        return invalidWheel("Do not enter BANKRUPT or LOSE A TURN. The game adds those automatically.");
      }

      const numeric = Number(entry.replace(/[$,\s]/g, ""));
      if (!Number.isFinite(numeric) || numeric < 0 || !Number.isInteger(numeric)) {
        return invalidWheel(`"${entry}" is not a valid non-negative whole-number point value.`);
      }

      const value = String(numeric);
      if (seen.has(value)) {
        return invalidWheel(`${value} was entered more than once. Enter each point value only once.`);
      }

      seen.add(value);
      values.push(value);
    }

    if (values.length < 4) {
      return invalidWheel("Enter at least four unique point values so the wheel has enough spacing.");
    }

    return { ok: true, values };
  }

  function invalidWheel(message) {
    return { ok: false, message };
  }

  function buildWheel(pointValues) {
    const numericSegments = pointValues.flatMap((value) => [String(value), String(value)]);
    const shuffledNumbers = shuffleArray([...numericSegments]);
    const totalSegments = shuffledNumbers.length + SPECIAL_SEGMENTS.length;
    const specialIndexes = chooseSpecialIndexes(totalSegments);
    const specials = shuffleArray([...SPECIAL_SEGMENTS]);

    const wheel = [];
    let numericIndex = 0;
    let specialIndex = 0;

    for (let index = 0; index < totalSegments; index += 1) {
      if (specialIndexes.has(index)) {
        wheel.push(specials[specialIndex++]);
      } else {
        wheel.push(shuffledNumbers[numericIndex++]);
      }
    }

    return wheel;
  }

  function chooseSpecialIndexes(totalSegments) {
    const candidates = Array.from({ length: totalSegments }, (_, index) => index);

    for (let attempt = 0; attempt < 500; attempt += 1) {
      const picked = shuffleArray([...candidates]).slice(0, 4).sort((a, b) => a - b);
      if (hasCircularSpacing(picked, totalSegments, MINIMUM_SPECIAL_DISTANCE)) {
        return new Set(picked);
      }
    }

    return new Set(
      Array.from({ length: 4 }, (_, index) => Math.floor((index * totalSegments) / 4))
    );
  }

  function hasCircularSpacing(indexes, totalSegments, minimumDistance) {
    for (let index = 0; index < indexes.length; index += 1) {
      const current = indexes[index];
      const next = indexes[(index + 1) % indexes.length];
      const distance = index === indexes.length - 1
        ? next + totalSegments - current
        : next - current;

      if (distance < minimumDistance) return false;
    }

    return true;
  }

  function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
  }

  function formatScore(value) {
    return Number(value || 0).toLocaleString("en-US");
  }

  function formatWheelValue(value) {
    if (value === null || value === undefined || value === "—") return "—";
    if (value === "BANKRUPT" || value === "LOSE A TURN") return value;
    return Number(value).toLocaleString("en-US");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.FridayWheelCore = Object.freeze({
    DEFAULT_WHEEL_VALUES,
    WHEEL_COLORS,
    createPlayer,
    isVowel,
    normalizePhrase,
    countLetter,
    parseWheelValues,
    buildWheel,
    hasCircularSpacing,
    formatScore,
    formatWheelValue,
    escapeHtml
  });
})();
