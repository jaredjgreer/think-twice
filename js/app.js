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

    // Initialize cloud sync (non-blocking)
    CloudSync.init().then(() => renderHomeLeaderboard());

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

    // Admin mode (tap title 5x)
    initAdminTrigger();
    wireAdminEvents();

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

  async function renderHomeLeaderboard() {
    const container = document.getElementById('home-leaderboard');

    // Try cloud leaderboard first, fall back to local
    let sorted = null;
    const cloudLb = await CloudSync.fetchLeaderboard();
    if (cloudLb && cloudLb.length > 0) {
      sorted = cloudLb;
    } else {
      sorted = Storage.getLeaderboardSorted();
    }

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
      // Sync new player to cloud
      const lb = Storage.getLeaderboard();
      if (lb[player.id]) CloudSync.syncNewPlayer(player, lb[player.id]);
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
    const tierLabel = ['', 'EASY', 'MEDIUM', 'HARD'][cp.tier] || '';
    banner.innerHTML = `═══ ${Players.iconHTML(cp)} ${sanitize(cp.name.toUpperCase())}'S TURN · ${tierLabel} ═══`;
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

    // Show tier/difficulty label
    const tierLabel = ['', 'EASY', 'MEDIUM', 'HARD'][cardData.tier] || '';
    const tierEl = document.getElementById('challenge-tier-label');
    tierEl.textContent = isSteal ? `⚡ STEAL · ${tierLabel}` : tierLabel;
    tierEl.className = `tier-label tier-${cardData.tier}`;

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
    if (result.correct) {
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndAdvance(result);
      };
    } else if (isSteal && result.stealAvailable) {
      // Cascading steal — another player can try for even more points
      document.getElementById('steal-section').style.display = 'block';
      document.getElementById('btn-challenge-next').style.display = 'none';

      const nextStealPoints = result.nextStealPoints || 5;
      const nextPlayer = peekNextStealPlayer();
      document.getElementById('steal-player-name').innerHTML =
        `${Players.iconHTML(nextPlayer)} ${sanitize(nextPlayer.name.toUpperCase())} CAN STEAL FOR ${nextStealPoints} PTS!`;

      document.getElementById('btn-steal-yes').onclick = () => {
        closeChallenge();
        Game.advanceTurn();
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
    } else if (isSteal) {
      // Everyone missed — move on
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndAdvance(result);
      };
    } else if (result.stealAvailable) {
      // First miss — offer steal to next player
      document.getElementById('steal-section').style.display = 'block';
      document.getElementById('btn-challenge-next').style.display = 'none';

      const nextPlayer = peekNextStealPlayer();
      document.getElementById('steal-player-name').innerHTML =
        `${Players.iconHTML(nextPlayer)} ${sanitize(nextPlayer.name.toUpperCase())} CAN STEAL FOR 25 PTS!`;

      document.getElementById('btn-steal-yes').onclick = () => {
        closeChallenge();
        Game.advanceTurn();
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

  function peekNextStealPlayer() {
    const gs = Game.getState();
    if (gs.pendingSteal) {
      // Find the next player who hasn't missed yet
      let idx = (gs.currentTurnIndex + 1) % gs.players.length;
      let safety = 0;
      while (gs.pendingSteal.missedPlayers.includes(idx) && safety < gs.players.length) {
        idx = (idx + 1) % gs.players.length;
        safety++;
      }
      return gs.players[idx];
    }
    // Fallback to simple next
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
    const gs = Game.getState();

    // Push each player's score to cloud
    sortedPlayers.forEach(p => {
      CloudSync.pushScore(p.id, p.sessionScore, gs.gameMode || 'classic');
    });

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

  // ─── Admin Mode ───

  let adminAuthenticated = false; // Session-only, never persisted
  let titleTapCount = 0;
  let titleTapTimer = null;

  function initAdminTrigger() {
    const titleEl = document.querySelector('.game-title');
    if (!titleEl) return;
    titleEl.addEventListener('click', () => {
      titleTapCount++;
      clearTimeout(titleTapTimer);
      titleTapTimer = setTimeout(() => { titleTapCount = 0; }, 2000);
      if (titleTapCount >= 5) {
        titleTapCount = 0;
        openAdminModal();
      }
    });
  }

  function openAdminModal() {
    const overlay = document.getElementById('admin-modal');
    const loginSection = document.getElementById('admin-login');
    const panelSection = document.getElementById('admin-panel');
    const errorEl = document.getElementById('admin-login-error');
    const keyInput = document.getElementById('admin-key-input');

    overlay.classList.add('active');
    errorEl.textContent = '';

    if (adminAuthenticated) {
      loginSection.style.display = 'none';
      panelSection.style.display = '';
      renderAdminPlayerList();
    } else {
      loginSection.style.display = '';
      panelSection.style.display = 'none';
      keyInput.value = '';
      setTimeout(() => keyInput.focus(), 100);
    }
  }

  function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
  }

  async function adminLogin() {
    const keyInput = document.getElementById('admin-key-input');
    const errorEl = document.getElementById('admin-login-error');
    const key = keyInput.value.trim();

    if (!key) {
      errorEl.textContent = 'ENTER ADMIN KEY';
      return;
    }

    const apiUrl = window.THINK_TWICE_API;
    if (!apiUrl) {
      errorEl.textContent = 'API NOT CONFIGURED';
      return;
    }

    try {
      const resp = await fetch(`${apiUrl}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key }
      });
      if (resp.ok) {
        adminAuthenticated = true;
        window._adminKey = key; // Keep in memory only
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = '';
        renderAdminPlayerList();
      } else {
        errorEl.textContent = 'WRONG KEY';
        keyInput.value = '';
        keyInput.focus();
      }
    } catch (e) {
      errorEl.textContent = 'CONNECTION FAILED';
    }
  }

  function renderAdminPlayerList() {
    const container = document.getElementById('admin-player-list');
    // Show local players (these are the ones on this device)
    const players = Storage.getPlayers();
    container.innerHTML = '';

    if (players.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:var(--text-dim); font-family:var(--font-terminal);">No players on this device</p>';
      return;
    }

    players.forEach(player => {
      const row = document.createElement('div');
      row.className = 'admin-player-row';
      const lockIcon = player.pin ? ' 🔒' : '';
      row.innerHTML = `
        <div class="info">
          <span class="neon-icon glow-${player.iconColor || 'cyan'}">${player.icon || '★'}</span>
          ${sanitize(player.name)}${lockIcon}
        </div>
      `;
      const delBtn = document.createElement('button');
      delBtn.className = 'admin-delete';
      delBtn.textContent = 'DELETE';
      delBtn.addEventListener('click', () => adminDeletePlayer(player, row));
      row.appendChild(delBtn);
      container.appendChild(row);
    });
  }

  async function adminDeletePlayer(player, rowEl) {
    // Delete locally (bypasses PIN entirely)
    Storage.deletePlayer(player.id);

    // Delete from cloud
    const apiUrl = window.THINK_TWICE_API;
    if (apiUrl && window._adminKey) {
      try {
        await fetch(`${apiUrl}/api/admin/player/${player.id}`, {
          method: 'DELETE',
          headers: { 'x-admin-key': window._adminKey }
        });
      } catch (e) {
        // Cloud delete failed — local still removed
      }
    } else {
      // Fallback to regular cloud delete
      CloudSync.deletePlayer(player.id);
    }

    rowEl.remove();
    // Check if list is now empty
    const container = document.getElementById('admin-player-list');
    if (!container.querySelector('.admin-player-row')) {
      container.innerHTML = '<p style="text-align:center; color:var(--text-dim); font-family:var(--font-terminal);">No players on this device</p>';
    }
  }

  function wireAdminEvents() {
    document.getElementById('btn-admin-cancel').addEventListener('click', closeAdminModal);
    document.getElementById('btn-admin-close').addEventListener('click', closeAdminModal);
    document.getElementById('btn-admin-login').addEventListener('click', adminLogin);
    document.getElementById('admin-key-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') adminLogin();
    });
  }

  return { init, showScreen };
})();

// Boot!
document.addEventListener('DOMContentLoaded', () => App.init());
