/* ═══════════════════════════════════════════
   THINK TWICE — Game Engine
   Turns, scoring, card logic, steal mechanic
   ═══════════════════════════════════════════ */

const Game = (() => {

  let state = {
    players: [],       // { id, name, emoji, age, tier, sessionScore, streak }
    currentTurnIndex: 0,
    cards: [],         // { index, biasId, biasData, flipped, completedBy, rarity }
    gridSize: 4,
    gameMode: 'classic', // classic, define, spot, mixed
    deckData: null,
    totalCards: 16,
    cardsCompleted: 0,
    pendingSteal: null, // { cardIndex, biasId, tier, challenge }
    gameActive: false,
    teams: null,        // null or [{ name, color, playerIds }]
    leaderId: null      // player id of current score leader (for crown system)
  };

  const MODES = {
    classic: { name: 'CLASSIC', desc: 'Read a scenario, name the bias' },
    define:  { name: 'DEFINE IT', desc: 'See the bias name, pick its definition' },
    spot:    { name: 'SPOT IT', desc: 'See the definition, pick the matching scenario' },
    mixed:   { name: 'MIXED', desc: 'A random mode each card' }
  };

  function init(players, gridSize, deckData, gameMode, teams) {
    const totalCards = gridSize * gridSize;

    // Shuffle the deck and pick enough cards
    const shuffledBiases = shuffle([...deckData.cards]);
    const selectedBiases = shuffledBiases.slice(0, totalCards);

    // If we need more cards than biases available, allow repeats
    while (selectedBiases.length < totalCards) {
      selectedBiases.push(shuffledBiases[selectedBiases.length % shuffledBiases.length]);
    }

    const cards = selectedBiases.slice(0, totalCards).map((bias, i) => {
      const selectedChallenges = {};
      for (const tier of ['1', '2', '3']) {
        if (bias.tiers[tier]) {
          const tierData = bias.tiers[tier];
          const allChallenges = [tierData.challenge];
          if (tierData.altChallenges) allChallenges.push(...tierData.altChallenges);
          selectedChallenges[tier] = allChallenges[Math.floor(Math.random() * allChallenges.length)];
        }
      }
      return {
        index: i,
        biasId: bias.id,
        biasData: bias,
        selectedChallenges,
        flipped: false,
        completedBy: null,
        rarity: 'normal' // will be assigned below
      };
    });

    // Assign card rarity (~10% rare/2x, ~5% wild, ~5% sabotage)
    const indices = cards.map((_, i) => i);
    const rarityPool = shuffle(indices);
    const rarCount = Math.max(1, Math.round(totalCards * 0.10));
    const wildCount = Math.max(0, Math.round(totalCards * 0.05));
    const saboCount = Math.max(0, Math.round(totalCards * 0.05));
    let ri = 0;
    for (let n = 0; n < rarCount && ri < rarityPool.length; n++, ri++) {
      cards[rarityPool[ri]].rarity = 'rare';
    }
    for (let n = 0; n < wildCount && ri < rarityPool.length; n++, ri++) {
      cards[rarityPool[ri]].rarity = 'wild';
    }
    for (let n = 0; n < saboCount && ri < rarityPool.length; n++, ri++) {
      cards[rarityPool[ri]].rarity = 'sabotage';
    }

    // Shuffle card positions
    const shuffledCards = shuffle(cards).map((card, i) => ({ ...card, index: i }));

    state = {
      players: players.map(p => ({
        ...p,
        tier: Players.getAgeTier(p.age),
        sessionScore: 0,
        streak: 0
      })),
      currentTurnIndex: 0,
      cards: shuffledCards,
      gridSize,
      gameMode: gameMode || 'classic',
      deckData,
      totalCards,
      cardsCompleted: 0,
      pendingSteal: null,
      gameActive: true,
      teams: teams || null,
      leaderId: null
    };

    saveState();
    return state;
  }

  function getCurrentPlayer() {
    return state.players[state.currentTurnIndex];
  }

  function getCard(index) {
    return state.cards[index];
  }

  function getState() {
    return state;
  }

  function flipCard(index) {
    const card = state.cards[index];
    if (card.flipped || card.completedBy) return null;
    card.flipped = true;

    const player = getCurrentPlayer();
    let tier = player.tier.toString();

    // Sabotage: bump tier up by 1 (harder question)
    if (card.rarity === 'sabotage') {
      const bumped = Math.min(3, parseInt(tier) + 1);
      tier = bumped.toString();
    }

    const tierData = card.biasData.tiers[tier];

    const mode = state.gameMode === 'mixed'
      ? shuffle(['classic', 'define', 'spot'])[0]
      : state.gameMode;

    const challenge = buildChallenge(card, tier, mode);

    return {
      card,
      biasName: card.biasData.name,
      definition: tierData.definition,
      tip: tierData.tip || '',
      challenge,
      tier: parseInt(tier),
      mode,
      rarity: card.rarity
    };
  }

  function buildChallenge(card, tier, mode) {
    const tierData = card.biasData.tiers[tier];
    const allBiases = state.deckData.cards;
    const isSunday = state.deckData.deckId === 'sunday' || state.deckData.deckId === 'gospel-questions';
    const isEQ = state.deckData.deckId === 'emotional-intelligence';

    if (mode === 'define') {
      // Show bias name, pick correct definition from options
      const correctDef = tierData.definition;
      const decoys = shuffle(
        allBiases
          .filter(b => b.id !== card.biasId && b.tiers[tier])
          .map(b => b.tiers[tier].definition)
      ).slice(0, 3);

      const options = shuffle([correctDef, ...decoys]);
      return {
        scenario: null,
        prompt: isSunday ? `What does "${card.biasData.name}" mean?`
              : isEQ ? `What does "${card.biasData.name}" mean?`
              : `What does "${card.biasData.name}" mean?`,
        options,
        correct: options.indexOf(correctDef),
        mode: 'define'
      };
    }

    if (mode === 'spot') {
      // Show definition, pick the scenario that matches
      const correctScenario = tierData.scenarioDoneTo;
      const decoys = shuffle(
        allBiases
          .filter(b => b.id !== card.biasId && b.tiers[tier])
          .map(b => b.tiers[tier].scenarioDoneTo)
      ).slice(0, 2);

      const options = shuffle([correctScenario, ...decoys]);
      return {
        scenario: null,
        prompt: isSunday ? 'Which scenario shows this principle?'
              : isEQ ? 'Which scenario shows this skill?'
              : 'Which scenario shows this bias?',
        options,
        correct: options.indexOf(correctScenario),
        mode: 'spot'
      };
    }

    // classic mode (default)
    const origChallenge = card.selectedChallenges
      ? (card.selectedChallenges[tier] || tierData.challenge)
      : tierData.challenge;
    return {
      scenario: origChallenge.scenario,
      prompt: isSunday ? 'What principle is this?'
            : isEQ ? 'What EQ skill is this?'
            : 'What bias is this?',
      options: origChallenge.options,
      correct: origChallenge.correct,
      mode: 'classic'
    };
  }

  function buildStealChallenge(card, tier) {
    const mode = state.gameMode === 'mixed'
      ? shuffle(['classic', 'define', 'spot'])[0]
      : state.gameMode;
    return buildChallenge(card, tier, mode);
  }

  function answerChallenge(cardIndex, selectedOptionIndex, challenge) {
    const card = state.cards[cardIndex];
    const player = getCurrentPlayer();
    const correct = selectedOptionIndex === challenge.correct;

    if (correct) {
      // Calculate points based on card rarity
      let basePoints = 50;
      if (card.rarity === 'rare') basePoints = 100;
      if (card.rarity === 'wild') basePoints = 75;
      player.sessionScore += basePoints;
      player.streak = (player.streak || 0) + 1;
      card.completedBy = player.id;
      state.cardsCompleted++;

      // Update leader tracking
      const oldLeader = state.leaderId;
      updateLeader();
      const newLeader = state.leaderId;
      const dethroned = oldLeader && oldLeader !== newLeader && oldLeader !== player.id;

      saveState();

      return {
        correct: true,
        points: basePoints,
        player,
        gameOver: state.cardsCompleted >= state.totalCards,
        streak: player.streak,
        rarity: card.rarity,
        dethroned: dethroned ? state.players.find(p => p.id === oldLeader) : null,
        newLeader: dethroned ? player : null
      };
    } else {
      // Flip card back, set up cascading steal opportunity
      card.flipped = false;
      player.streak = 0;
      state.pendingSteal = {
        cardIndex,
        biasId: card.biasId,
        originalPlayerIndex: state.currentTurnIndex,
        stealPoints: 25,
        missedPlayers: [state.currentTurnIndex]
      };
      saveState();

      return {
        correct: false,
        points: 0,
        player,
        gameOver: false,
        stealAvailable: state.players.length > 1,
        streak: 0,
        rarity: card.rarity
      };
    }
  }

  function attemptSteal(selectedOptionIndex, challenge) {
    if (!state.pendingSteal) return null;

    const card = state.cards[state.pendingSteal.cardIndex];
    const stealPlayer = getCurrentPlayer();
    const correct = selectedOptionIndex === challenge.correct;
    const stealPoints = state.pendingSteal.stealPoints;

    if (correct) {
      stealPlayer.sessionScore += stealPoints;
      stealPlayer.streak = (stealPlayer.streak || 0) + 1;
      card.completedBy = stealPlayer.id;
      card.flipped = true;
      state.cardsCompleted++;
      state.pendingSteal = null;

      const oldLeader = state.leaderId;
      updateLeader();
      const newLeader = state.leaderId;
      const dethroned = oldLeader && oldLeader !== newLeader && oldLeader !== stealPlayer.id;

      return {
        correct: true,
        points: stealPoints,
        player: stealPlayer,
        gameOver: state.cardsCompleted >= state.totalCards,
        dethroned: dethroned ? state.players.find(p => p.id === oldLeader) : null,
        newLeader: dethroned ? stealPlayer : null
      };
    } else {
      stealPlayer.streak = 0;
      // Steal failed — pot grows, track who missed
      state.pendingSteal.missedPlayers.push(state.currentTurnIndex);
      state.pendingSteal.stealPoints += 25;

      // Check if any player hasn't tried yet
      const remaining = state.players.filter((_, i) =>
        !state.pendingSteal.missedPlayers.includes(i)
      );

      if (remaining.length === 0) {
        // Everyone missed — card goes back face-down
        state.pendingSteal = null;
        saveState();
        return {
          correct: false,
          points: 0,
          player: stealPlayer,
          gameOver: false,
          stealAvailable: false
        };
      }

      saveState();
      return {
        correct: false,
        points: 0,
        player: stealPlayer,
        gameOver: false,
        stealAvailable: true,
        nextStealPoints: state.pendingSteal.stealPoints
      };
    }
  }

  function skipCard(cardIndex) {
    const card = state.cards[cardIndex];
    card.flipped = false;
    const player = getCurrentPlayer();
    player.streak = 0;
    state.pendingSteal = null;
    saveState();
  }

  function advanceTurn() {
    state.currentTurnIndex = (state.currentTurnIndex + 1) % state.players.length;
    // Skip players who already missed during cascading steal
    if (state.pendingSteal) {
      let safety = 0;
      while (state.pendingSteal.missedPlayers.includes(state.currentTurnIndex) && safety < state.players.length) {
        state.currentTurnIndex = (state.currentTurnIndex + 1) % state.players.length;
        safety++;
      }
    }
    saveState();
    return getCurrentPlayer();
  }

  function skipSteal() {
    state.pendingSteal = null;
    saveState();
  }

  // Tic-tac-toe bonus: check if a player completed a full row, column, or diagonal
  function checkTTTBonus(cardIndex, playerId) {
    const size = state.gridSize;
    const row = Math.floor(cardIndex / size);
    const col = cardIndex % size;
    const bonusIndices = new Set();

    // Check row
    const rowStart = row * size;
    let rowComplete = true;
    for (let c = 0; c < size; c++) {
      if (state.cards[rowStart + c].completedBy !== playerId) { rowComplete = false; break; }
    }
    if (rowComplete) {
      for (let c = 0; c < size; c++) bonusIndices.add(rowStart + c);
    }

    // Check column
    let colComplete = true;
    for (let r = 0; r < size; r++) {
      if (state.cards[r * size + col].completedBy !== playerId) { colComplete = false; break; }
    }
    if (colComplete) {
      for (let r = 0; r < size; r++) bonusIndices.add(r * size + col);
    }

    // Check main diagonal (if card is on it)
    if (row === col) {
      let diagComplete = true;
      for (let d = 0; d < size; d++) {
        if (state.cards[d * size + d].completedBy !== playerId) { diagComplete = false; break; }
      }
      if (diagComplete) {
        for (let d = 0; d < size; d++) bonusIndices.add(d * size + d);
      }
    }

    // Check anti-diagonal (if card is on it)
    if (row + col === size - 1) {
      let antiComplete = true;
      for (let d = 0; d < size; d++) {
        if (state.cards[d * size + (size - 1 - d)].completedBy !== playerId) { antiComplete = false; break; }
      }
      if (antiComplete) {
        for (let d = 0; d < size; d++) bonusIndices.add(d * size + (size - 1 - d));
      }
    }

    if (bonusIndices.size === 0) return null;

    // Mark cards and award bonus (only for newly-detected bonus cards)
    let newBonusCards = 0;
    bonusIndices.forEach(idx => {
      if (!state.cards[idx].tttBonus) {
        state.cards[idx].tttBonus = true;
        newBonusCards++;
      }
    });

    if (newBonusCards === 0) return null;

    const bonusPoints = newBonusCards * 25;
    const player = state.players.find(p => p.id === playerId);
    if (player) player.sessionScore += bonusPoints;

    saveState();
    return { bonusPoints, bonusCardIndices: [...bonusIndices] };
  }

  function updateLeader() {
    let maxScore = -1;
    let leader = null;
    state.players.forEach(p => {
      if (p.sessionScore > maxScore) {
        maxScore = p.sessionScore;
        leader = p.id;
      }
    });
    // Only set leader if someone actually has points and leads uniquely
    const tied = state.players.filter(p => p.sessionScore === maxScore);
    state.leaderId = (maxScore > 0 && tied.length === 1) ? leader : state.leaderId;
  }

  // Timer duration shrinks with streak: 60 → 50 → 40 → 30 (min 30)
  function getTimerDuration(player) {
    const streak = player.streak || 0;
    return Math.max(30, 60 - streak * 10);
  }

  function getTeamScores() {
    if (!state.teams) return null;
    return state.teams.map(team => ({
      ...team,
      score: state.players
        .filter(p => team.playerIds.includes(p.id))
        .reduce((sum, p) => sum + p.sessionScore, 0)
    }));
  }

  function isGameOver() {
    return state.cardsCompleted >= state.totalCards;
  }

  function getResults() {
    const sorted = [...state.players].sort((a, b) => b.sessionScore - a.sessionScore);
    const biasesSeen = state.cards.map(c => ({
      name: c.biasData.name,
      completedBy: c.completedBy,
      wasCompleted: c.completedBy !== null
    }));

    return { sortedPlayers: sorted, biasesSeen };
  }

  function finalizeScores() {
    state.players.forEach(p => {
      Storage.updateLeaderboard(p.id, p.sessionScore);
    });
    state.gameActive = false;
    Storage.clearGameState();
  }

  // Fisher-Yates shuffle
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function saveState() {
    if (state.gameActive) Storage.saveGameState(state);
  }

  function restoreState(savedState) {
    state = savedState;
    state.gameActive = true;
  }

  return {
    MODES,
    init,
    getCurrentPlayer,
    getCard,
    getState,
    flipCard,
    buildStealChallenge,
    answerChallenge,
    attemptSteal,
    checkTTTBonus,
    advanceTurn,
    skipSteal,
    skipCard,
    isGameOver,
    getResults,
    finalizeScores,
    restoreState,
    getTimerDuration,
    getTeamScores
  };
})();
