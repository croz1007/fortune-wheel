(() => {
  "use strict";

  const BLOCKED_WORDS = new Set([
    "arse", "arsehole", "ass", "asshole", "bastard", "bitch",
    "bollocks", "boner", "bullshit", "cocksucker", "crap", "cunt",
    "damn", "dick", "dickhead", "douche", "douchebag", "fuck",
    "fucker", "fucking", "goddamn", "hell", "jackass",
    "motherfucker", "motherfucking", "piss", "prick", "pussy",
    "shit", "shithead", "slut", "sonofabitch", "twat", "whore"
  ]);

  const LEET_MAP = {
    "0": "o", "1": "i", "2": "z", "3": "e", "4": "a",
    "5": "s", "6": "g", "7": "t", "8": "b", "9": "g",
    "@": "a", "$": "s", "!": "i"
  };

  function normalizeForFilter(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[0123456789@$!]/g, (char) => LEET_MAP[char] || char);
  }

  function collapseRepeats(value) {
    return value.replace(/(.)\1+/g, "$1");
  }

  function tokenize(value) {
    const normalized = normalizeForFilter(value);

    const baseTokens = normalized
      .replace(/[^a-z]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const candidates = [];

    function addCandidate(token) {
      if (!token) return;
      candidates.push(token);

      const collapsed = collapseRepeats(token);
      if (collapsed !== token) {
        candidates.push(collapsed);
      }
    }

    for (let i = 0; i < baseTokens.length; i += 1) {
      addCandidate(baseTokens[i]);

      if (i + 1 < baseTokens.length) {
        addCandidate(baseTokens[i] + baseTokens[i + 1]);
      }

      if (i + 2 < baseTokens.length) {
        addCandidate(baseTokens[i] + baseTokens[i + 1] + baseTokens[i + 2]);
      }

      if (i + 3 < baseTokens.length) {
        addCandidate(
          baseTokens[i] +
          baseTokens[i + 1] +
          baseTokens[i + 2] +
          baseTokens[i + 3]
        );
      }
    }

    return candidates;
  }

  function findBlockedWord(value) {
    for (const token of tokenize(value)) {
      if (BLOCKED_WORDS.has(token)) {
        return token;
      }
    }

    return null;
  }

  function isAllowed(value) {
    return findBlockedWord(value) === null;
  }

  window.ClassroomFilter = Object.freeze({
    isAllowed,
    findBlockedWord
  });
})();
