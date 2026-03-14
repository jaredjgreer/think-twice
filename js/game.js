/* ═══════════════════════════════════════════
   THINK TWICE — Game Engine
   Turns, scoring, card logic, steal mechanic
   ═══════════════════════════════════════════ */

const Game = (() => {

  let state = {
    players: [],       // { id, name, emoji, age, tier, sessionScore }
    currentTurnIndex: 0,
    cards: [],         // { index, biasId, biasData, flipped, completedBy }
    gridSize: 4,
    gameMode: 'classic', // classic, define, spot, mixed
    deckData: null,
    totalCards: 16,
    cardsCompleted: 0,
    pendingSteal: null, // { cardIndex, biasId, tier, challenge }
    gameActive: false
  };

  const MODES = {
    classic: { name: 'CLASSIC', desc: 'Read a scenario, name the bias' },
    define:  { name: 'DEFINE IT', desc: 'See the bias name, pick its definition' },
    spot:    { name: 'SPOT IT', desc: 'See the definition, pick the matching scenario' },
    mixed:   { name: 'MIXED', desc: 'A random mode each card' }
  };

  function init(players, gridSize, deckData, gameMode) {
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
        completedBy: null
      };
    });

    // Shuffle card positions
    const shuffledCards = shuffle(cards).map((card, i) => ({ ...card, index: i }));

    state = {
      players: players.map(p => ({
        ...p,
        tier: Players.getAgeTier(p.age),
        sessionScore: 0
      })),
      currentTurnIndex: 0,
      cards: shuffledCards,
      gridSize,
      gameMode: gameMode || 'classic',
      deckData,
      totalCards,
      cardsCompleted: 0,
      pendingSteal: null,
      gameActive: true
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
    const tier = player.tier.toString();
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
      mode
    };
  }

  function buildChallenge(card, tier, mode) {
    const tierData = card.biasData.tiers[tier];
    const allBiases = state.deckData.cards;

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
        prompt: `What does "${card.biasData.name}" mean?`,
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
        prompt: 'Which scenario shows this bias?',
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
      prompt: 'What bias is this?',
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
      // Award points
      player.sessionScore += 50;
      card.completedBy = player.id;
      state.cardsCompleted++;
      saveState();

      return {
        correct: true,
        points: 50,
        player,
        gameOver: state.cardsCompleted >= state.totalCards
      };
    } else {
      // Flip card back, set up cascading steal opportunity
      card.flipped = false;
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
        stealAvailable: state.players.length > 1
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
      card.completedBy = stealPlayer.id;
      card.flipped = true;
      state.cardsCompleted++;
      state.pendingSteal = null;

      return {
        correct: true,
        points: stealPoints,
        player: stealPlayer,
        gameOver: state.cardsCompleted >= state.totalCards
      };
    } else {
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
    advanceTurn,
    skipSteal,
    isGameOver,
    getResults,
    finalizeScores,
    restoreState
  };
})();
