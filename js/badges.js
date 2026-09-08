/* ═══════════════════════════════════════════
   THINK TWICE — Badges Module
   Loads badge definitions and awards them based
   on per-player counters kept in localStorage.
   Persistent progression, no XP/levels.
   ═══════════════════════════════════════════ */

const Badges = (() => {

  let definitions = null;

  async function load() {
    if (definitions) return definitions;
    try {
      const resp = await fetch('data/badges.json');
      const data = await resp.json();
      definitions = data.badges || [];
    } catch (_) {
      definitions = [];
    }
    return definitions;
  }

  function getDefinitions() { return definitions || []; }

  function _counterKey(playerId) { return 'tt_bcounters_' + playerId; }

  function _getCounters(playerId) {
    try { return JSON.parse(localStorage.getItem(_counterKey(playerId)) || '{}'); }
    catch { return {}; }
  }

  function _saveCounters(playerId, c) {
    localStorage.setItem(_counterKey(playerId), JSON.stringify(c));
  }

  // Returns array of newly-awarded badge definitions.
  function _checkAndAward(playerId, counters) {
    const newly = [];
    (definitions || []).forEach(b => {
      let progress = 0;
      switch (b.type) {
        case 'any-correct':
          progress = counters.correctAny || 0;
          break;
        case 'deck-correct':
          progress = (counters.correctByDeck && counters.correctByDeck[b.deck]) || 0;
          break;
        case 'streak':
          progress = counters.bestStreak || 0;
          break;
        case 'games':
          progress = counters.gamesPlayed || 0;
          break;
        case 'calm-corner':
          progress = counters.calmCornerFinished || 0;
          break;
        case 'decks-touched':
          progress = counters.decksTouched ? Object.keys(counters.decksTouched).length : 0;
          break;
      }
      if (progress >= b.count) {
        const wasNew = Storage.awardBadge(playerId, b.id);
        if (wasNew) newly.push(b);
      }
    });
    return newly;
  }

  function recordCorrect(playerId, deckId) {
    if (!playerId) return [];
    const c = _getCounters(playerId);
    c.correctAny = (c.correctAny || 0) + 1;
    c.correctByDeck = c.correctByDeck || {};
    if (deckId) c.correctByDeck[deckId] = (c.correctByDeck[deckId] || 0) + 1;
    c.decksTouched = c.decksTouched || {};
    if (deckId) c.decksTouched[deckId] = 1;
    _saveCounters(playerId, c);
    return _checkAndAward(playerId, c);
  }

  function recordStreak(playerId, streak) {
    if (!playerId) return [];
    const c = _getCounters(playerId);
    if ((streak || 0) > (c.bestStreak || 0)) c.bestStreak = streak;
    _saveCounters(playerId, c);
    return _checkAndAward(playerId, c);
  }

  function recordGameFinished(playerId) {
    if (!playerId) return [];
    const c = _getCounters(playerId);
    c.gamesPlayed = (c.gamesPlayed || 0) + 1;
    _saveCounters(playerId, c);
    return _checkAndAward(playerId, c);
  }

  function recordCalmCornerFinished(playerId) {
    if (!playerId) return [];
    const c = _getCounters(playerId);
    c.calmCornerFinished = (c.calmCornerFinished || 0) + 1;
    _saveCounters(playerId, c);
    return _checkAndAward(playerId, c);
  }

  // Snapshot for UI: [{def, earned, earnedAt}]
  function forPlayer(playerId) {
    const earned = Storage.getBadges(playerId);
    return (definitions || []).map(b => ({
      def: b,
      earned: !!earned[b.id],
      earnedAt: earned[b.id] ? earned[b.id].earnedAt : 0
    }));
  }

  return {
    load,
    getDefinitions,
    recordCorrect,
    recordStreak,
    recordGameFinished,
    recordCalmCornerFinished,
    forPlayer
  };
})();
