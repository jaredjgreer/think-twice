/* ═══════════════════════════════════════════
   THINK TWICE — App Shell
   Screen routing, event wiring, UI orchestration
   ═══════════════════════════════════════════ */

const App = (() => {

  let deckData = null;
  let selectedGridSize = 4;
  let selectedGameMode = 'classic';
  let selectedPlayerIds = [];

  // ─── Screen Navigation ───

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  // ─── Initialize ───

  async function init() {
    // Load deck data
    const resp = await fetch('data/cognitive-biases.json');
    deckData = await resp.json();

    // Wire up home screen
    document.getElementById('btn-press-start').addEventListener('click', () => openSetup());
    document.getElementById('btn-players-home').addEventListener('click', () => openSetup());

    // Wire up setup screen
    document.getElementById('btn-add-player').addEventListener('click', () => Players.showAddPlayerModal());
    document.getElementById('btn-save-player').addEventListener('click', handleSavePlayer);
    document.getElementById('btn-cancel-player').addEventListener('click', () => Players.hideAddPlayerModal());
    document.getElementById('btn-start-game').addEventListener('click', handleStartGame);
    document.getElementById('btn-back-home').addEventListener('click', () => {
      renderHomeLeaderboard();
      showScreen('home-screen');
    });

    // Wire grid size selectors
    document.querySelectorAll('.grid-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedGridSize = parseInt(btn.dataset.size);
      });
    });

    // Wire game mode selectors
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedGameMode = btn.dataset.mode;
      });
    });

    // Wire game-over buttons
    document.getElementById('btn-rematch').addEventListener('click', handleRematch);
    document.getElementById('btn-go-home').addEventListener('click', () => {
      renderHomeLeaderboard();
      showScreen('home-screen');
    });

    // Wire game-screen home button
    document.getElementById('btn-game-home').addEventListener('click', () => {
      Game.getState().gameActive = false;
      Storage.clearGameState();
      renderHomeLeaderboard();
      showScreen('home-screen');
    });

    // Wire export/import
    document.getElementById('btn-export').addEventListener('click', handleExport);
    document.getElementById('btn-import').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', handleImport);

    // Wire help
    document.getElementById('btn-help').addEventListener('click', () => {
      document.getElementById('help-modal').classList.add('active');
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
      document.getElementById('help-modal').classList.remove('active');
    });

    // Render initial leaderboard
    renderHomeLeaderboard();
    showScreen('home-screen');

    // Check for saved game
    const savedGame = Storage.getGameState();
    if (savedGame && savedGame.gameActive) {
      document.getElementById('resume-modal').classList.add('active');
      document.getElementById('btn-resume-yes').onclick = () => {
        document.getElementById('resume-modal').classList.remove('active');
        Game.restoreState(savedGame);
        renderGameBoard();
        showPassScreen();
      };
      document.getElementById('btn-resume-no').onclick = () => {
        document.getElementById('resume-modal').classList.remove('active');
        Storage.clearGameState();
      };
    }

    // Keep screen awake if supported
    requestWakeLock();
  }

  // ─── Home Screen ───

  function renderHomeLeaderboard() {
    const container = document.getElementById('home-leaderboard');
    const sorted = Storage.getLeaderboardSorted();
    container.innerHTML = '';

    if (sorted.length === 0) {
      container.innerHTML = '<div class="score-row"><span style="color:var(--text-dim)">No players yet</span></div>';
      return;
    }

    const ranks = ['1ST', '2ND', '3RD'];
    sorted.slice(0, 10).forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'score-row';
      row.innerHTML = `
        <span class="rank">${ranks[i] || (i + 1) + 'TH'}</span>
        <span class="player-name">${Players.iconHTML(entry)} ${sanitize(entry.name)}</span>
        <span class="player-score">${padScore(entry.totalPoints)}</span>
      `;
      container.appendChild(row);
    });
  }

  // ─── Setup Screen ───

  function openSetup() {
    selectedPlayerIds = [];
    showScreen('setup-screen');
    Players.renderPlayerList(document.getElementById('player-list-container'), (ids) => {
      selectedPlayerIds = ids;
    });
    // Default grid size selection
    document.querySelectorAll('.grid-option').forEach(b => b.classList.remove('selected'));
    const defaultBtn = document.querySelector(`.grid-option[data-size="${selectedGridSize}"]`);
    if (defaultBtn) defaultBtn.classList.add('selected');

    // Default mode selection
    document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('selected'));
    const defaultMode = document.querySelector(`.mode-option[data-mode="${selectedGameMode}"]`);
    if (defaultMode) defaultMode.classList.add('selected');
  }

  function handleSavePlayer() {
    const player = Players.saveNewPlayerFromModal();
    if (player) {
      Players.hideAddPlayerModal();
      Players.renderPlayerList(document.getElementById('player-list-container'), (ids) => {
        selectedPlayerIds = ids;
      });
    }
  }

  // ─── Start Game ───

  function handleStartGame() {
    if (selectedPlayerIds.length < 1) return;

    const players = Players.getPlayersById(selectedPlayerIds);
    const totalCards = selectedGridSize * selectedGridSize;

    // Check if we have enough bias content
    if (!deckData || deckData.cards.length === 0) return;

    Game.init(players, selectedGridSize, deckData, selectedGameMode);
    renderGameBoard();
    showPassScreen();
  }

  // ─── Render Game Board ───

  function renderGameBoard() {
    const gs = Game.getState();
    const grid = document.getElementById('card-grid');
    grid.className = `card-grid grid-bg grid-${gs.gridSize}x${gs.gridSize}`;
    grid.innerHTML = '';

    gs.cards.forEach((card, i) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.index = i;

      if (card.completedBy) {
        const completedPlayer = gs.players.find(p => p.id === card.completedBy);
        cardEl.classList.add('completed', 'flipped');
        cardEl.innerHTML = `
          <div class="card-inner">
            <div class="card-back">
              <span class="card-label">THINK<br>TWICE</span>
            </div>
            <div class="card-front">
              <span class="bias-name">${sanitize(card.biasData.name)}</span>
              <span class="completed-by">${completedPlayer ? Players.iconHTML(completedPlayer) : '✓'}</span>
            </div>
          </div>
        `;
      } else {
        cardEl.innerHTML = `
          <div class="card-inner">
            <div class="card-back">
              <span class="card-label">THINK<br>TWICE</span>
            </div>
            <div class="card-front">
              <span class="bias-name">${sanitize(card.biasData.name)}</span>
            </div>
          </div>
        `;
        cardEl.addEventListener('click', () => handleCardTap(i));
      }

      grid.appendChild(cardEl);
    });

    renderScoreboard();
  }

  function renderScoreboard() {
    const gs = Game.getState();
    const sb = document.getElementById('scoreboard');
    sb.innerHTML = '';

    gs.players.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'sb-player' + (i === gs.currentTurnIndex ? ' active-turn' : '');
      div.innerHTML = `${Players.iconHTML(p)} ${sanitize(p.name)} <span class="sb-score">${padScore(p.sessionScore)}</span>`;
      sb.appendChild(div);
    });

    const banner = document.getElementById('turn-banner');
    const cp = Game.getCurrentPlayer();
    banner.innerHTML = `═══ ${Players.iconHTML(cp)} ${sanitize(cp.name.toUpperCase())}'S TURN ═══`;
  }

  // ─── Pass Screen (between turns) ───

  function showPassScreen() {
    const cp = Game.getCurrentPlayer();
    const gs = Game.getState();

    // Skip pass screen if single player
    if (gs.players.length === 1) {
      showScreen('game-screen');
      renderGameBoard();
      return;
    }

    const passIcon = document.getElementById('pass-emoji');
    passIcon.textContent = Players.iconChar(cp);
    passIcon.className = 'pass-emoji glow-' + (cp.iconColor || 'cyan');
    document.getElementById('pass-name').textContent = `PASS TO ${cp.name.toUpperCase()}`;
    showScreen('pass-screen');

    document.getElementById('btn-ready').onclick = () => {
      showScreen('game-screen');
      renderGameBoard();
    };
  }

  // ─── Card Tap ───

  function handleCardTap(index) {
    const gs = Game.getState();
    if (!gs.gameActive) return;

    const card = Game.getCard(index);
    if (card.flipped || card.completedBy) return;

    const result = Game.flipCard(index);
    if (!result) return;

    Sound.play('flip');

    // Animate the card flip
    const cardEl = document.querySelector(`.card[data-index="${index}"]`);
    if (cardEl) cardEl.classList.add('flipped');

    // Show challenge modal after a brief delay
    setTimeout(() => {
      showChallenge(result, index, false);
    }, 500);
  }

  // ─── Challenge Modal ───

  function showChallenge(cardData, cardIndex, isSteal) {
    const overlay = document.getElementById('challenge-overlay');
    overlay.classList.add('active');

    const mode = cardData.challenge.mode || 'classic';
    const biasNameEl = document.getElementById('challenge-bias-name');
    const definitionEl = document.getElementById('challenge-definition');
    const scenarioEl = document.getElementById('challenge-scenario');

    // Store bias name for post-answer reveal
    biasNameEl.dataset.answer = cardData.biasName;

    // Mode-specific layout
    if (mode === 'define') {
      // Define mode: show the bias name (it's the prompt), hide definition & scenario
      biasNameEl.textContent = cardData.biasName;
      definitionEl.textContent = '';
      definitionEl.style.display = 'none';
      scenarioEl.textContent = '';
      scenarioEl.style.display = 'none';
    } else if (mode === 'spot') {
      // Spot mode: hide bias name, show definition, player picks the scenario
      biasNameEl.textContent = '? ? ?';
      definitionEl.textContent = cardData.definition;
      definitionEl.style.display = '';
      scenarioEl.textContent = '';
      scenarioEl.style.display = 'none';
    } else {
      // Classic mode: hide bias name (it's the answer!), show scenario only
      // Definition is revealed after answering
      biasNameEl.textContent = '? ? ?';
      definitionEl.textContent = '';
      definitionEl.style.display = 'none';
      scenarioEl.textContent = cardData.challenge.scenario || '';
      scenarioEl.style.display = cardData.challenge.scenario ? '' : 'none';
    }

    const promptText = isSteal
      ? `⚡ STEAL — ${cardData.challenge.prompt.toUpperCase()}`
      : cardData.challenge.prompt.toUpperCase();
    document.getElementById('challenge-question').textContent = promptText;

    // Render options
    const optionsContainer = document.getElementById('challenge-options');
    optionsContainer.innerHTML = '';

    cardData.challenge.options.forEach((option, i) => {
      const btn = document.createElement('button');
      btn.className = 'challenge-option';
      btn.textContent = option;
      btn.addEventListener('click', () => handleChallengeAnswer(cardIndex, i, cardData, isSteal));
      optionsContainer.appendChild(btn);
    });

    // Hide result and tip
    document.getElementById('challenge-result').className = 'challenge-result';
    document.getElementById('challenge-result').style.display = 'none';
    document.getElementById('tip-reveal').className = 'tip-reveal';
    document.getElementById('btn-challenge-next').style.display = 'none';
    document.getElementById('steal-section').style.display = 'none';
  }

  function handleChallengeAnswer(cardIndex, selectedIndex, cardData, isSteal) {
    let result;

    if (isSteal) {
      result = Game.attemptSteal(selectedIndex, cardData.challenge);
    } else {
      result = Game.answerChallenge(cardIndex, selectedIndex, cardData.challenge);
    }

    // Disable all options
    document.querySelectorAll('.challenge-option').forEach(btn => btn.classList.add('disabled'));

    // Highlight correct/wrong
    const options = document.querySelectorAll('.challenge-option');
    const correctIndex = cardData.challenge.correct;
    options[correctIndex].classList.add('correct');
    if (!result.correct) {
      options[selectedIndex].classList.add('wrong');
    }

    // Show result text
    const resultEl = document.getElementById('challenge-result');
    resultEl.style.display = 'block';
    if (result.correct) {
      resultEl.className = 'challenge-result show correct';
      resultEl.textContent = isSteal ? `⚡ STOLEN! +${result.points}` : `✧ CORRECT! +${result.points} ✧`;
      Sound.play(isSteal ? 'steal' : 'correct');
      document.getElementById('game-screen').classList.add('correct-burst');
      setTimeout(() => document.getElementById('game-screen').classList.remove('correct-burst'), 400);
    } else {
      resultEl.className = 'challenge-result show wrong';
      resultEl.textContent = '✗ WRONG ✗';
      Sound.play('wrong');
      document.getElementById('game-screen').classList.add('screen-shake');
      setTimeout(() => document.getElementById('game-screen').classList.remove('screen-shake'), 400);
    }

    // Reveal the bias name and definition now that the player has answered
    const biasNameEl2 = document.getElementById('challenge-bias-name');
    if (biasNameEl2.dataset.answer) {
      biasNameEl2.textContent = biasNameEl2.dataset.answer;
    }
    const definitionEl2 = document.getElementById('challenge-definition');
    if (!definitionEl2.textContent && cardData.definition) {
      definitionEl2.textContent = cardData.definition;
      definitionEl2.style.display = '';
    }

    // Show avoidance tip
    const tipReveal = document.getElementById('tip-reveal');
    tipReveal.className = 'tip-reveal show';
    document.getElementById('tip-text').textContent = cardData.tip || '';

    // Scroll challenge box to show tip and next button
    const challengeBox = document.querySelector('.challenge-box');
    setTimeout(() => challengeBox.scrollTo({ top: challengeBox.scrollHeight, behavior: 'smooth' }), 150);

    // Show next button or steal option
    if (result.correct || isSteal) {
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndAdvance(result);
      };
    } else if (result.stealAvailable) {
      // Show steal option
      document.getElementById('steal-section').style.display = 'block';
      document.getElementById('btn-challenge-next').style.display = 'none';

      const nextPlayer = peekNextPlayer();
      document.getElementById('steal-player-name').innerHTML =
        `${Players.iconHTML(nextPlayer)} ${sanitize(nextPlayer.name.toUpperCase())} CAN STEAL`;

      document.getElementById('btn-steal-yes').onclick = () => {
        closeChallenge();
        Game.advanceTurn();
        // Re-flip the card data with the stealing player's tier
        const card = Game.getCard(cardIndex);
        const stealer = Game.getCurrentPlayer();
        const stealTier = stealer.tier.toString();
        const tierData = card.biasData.tiers[stealTier];
        const stealChallenge = Game.buildStealChallenge(card, stealTier);
        const stealCardData = {
          biasName: card.biasData.name,
          definition: tierData.definition,
          tip: tierData.tip || '',
          challenge: stealChallenge,
          tier: stealer.tier,
          mode: stealChallenge.mode
        };
        Sound.play('steal');
        showChallenge(stealCardData, cardIndex, true);
      };

      document.getElementById('btn-steal-no').onclick = () => {
        Game.skipSteal();
        closeChallengeAndAdvance({ correct: false, gameOver: false });
      };
    } else {
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('btn-challenge-next').onclick = () => {
        Game.skipSteal();
        closeChallengeAndAdvance(result);
      };
    }
  }

  function peekNextPlayer() {
    const gs = Game.getState();
    const nextIndex = (gs.currentTurnIndex + 1) % gs.players.length;
    return gs.players[nextIndex];
  }

  function closeChallenge() {
    document.getElementById('challenge-overlay').classList.remove('active');
  }

  function closeChallengeAndAdvance(result) {
    closeChallenge();

    if (result.gameOver || Game.isGameOver()) {
      endGame();
      return;
    }

    // Always advance turn after answering (one card per turn)
    Game.advanceTurn();
    showPassScreen();
  }

  // ─── Game Over ───

  function endGame() {
    Sound.play('gameover');
    Game.finalizeScores();
    const { sortedPlayers, biasesSeen } = Game.getResults();

    document.getElementById('gameover-winner-text').innerHTML =
      `WINNER: ${Players.iconHTML(sortedPlayers[0])} ${sanitize(sortedPlayers[0].name.toUpperCase())}`;

    const scoresContainer = document.getElementById('gameover-scores');
    scoresContainer.innerHTML = '';
    sortedPlayers.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'gameover-row';
      row.innerHTML = `
        <span class="go-name">${Players.iconHTML(p)} ${sanitize(p.name)} ${i === 0 ? '♛' : ''}</span>
        <span class="go-score">${padScore(p.sessionScore)}</span>
      `;
      scoresContainer.appendChild(row);
    });

    const biasesContainer = document.getElementById('gameover-biases-list');
    biasesContainer.innerHTML = '';
    // Deduplicate biases
    const seen = new Set();
    biasesSeen.forEach(b => {
      if (seen.has(b.name)) return;
      seen.add(b.name);
      const row = document.createElement('div');
      row.className = 'gameover-bias-row ' + (b.wasCompleted ? 'got-it' : 'missed');
      row.textContent = (b.wasCompleted ? '✧ ' : '✗ ') + b.name;
      biasesContainer.appendChild(row);
    });

    showScreen('gameover-screen');
  }

  function handleRematch() {
    // Same players, new game
    const gs = Game.getState();
    Game.init(
      gs.players.map(p => ({ id: p.id, name: p.name, icon: p.icon, iconColor: p.iconColor, emoji: p.icon || p.emoji, age: p.age, birthMonth: p.birthMonth, birthYear: p.birthYear })),
      gs.gridSize,
      gs.deckData,
      gs.gameMode
    );
    renderGameBoard();
    showPassScreen();
  }

  // ─── Export ───

  function handleExport() {
    const data = Storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'think-twice-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        Storage.importData(event.target.result);
        renderHomeLeaderboard();
        e.target.value = '';
      } catch (err) {
        // Invalid file
      }
    };
    reader.readAsText(file);
  }

  // ─── Utilities ───

  function padScore(n) {
    return String(n).padStart(5, '0');
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        await navigator.wakeLock.request('screen');
      } catch (e) {
        // Wake lock not available — that's okay
      }
    }
  }

  return { init, showScreen };
})();

// Boot!
document.addEventListener('DOMContentLoaded', () => App.init());
