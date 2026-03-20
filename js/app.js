/* ═══════════════════════════════════════════
   THINK TWICE — App Shell
   Screen routing, event wiring, UI orchestration
   ═══════════════════════════════════════════ */

const App = (() => {

  let deckData = null;
  let selectedGridSize = 4;
  let selectedGameMode = 'classic';
  let tutorModeActive = false;
  let timerOffTier1 = false;
  let timerOffAll = false;
  let selectedPlayerIds = [];
  let selectedDeckIds = ['cognitive-biases'];
  let timerInterval = null;
  let timerSeconds = 60;
  let selectedTeams = null; // null or [{ name, color, playerIds }]

  const DECK_FILES = {
    'cognitive-biases': 'data/cognitive-biases.json',
    'sunday': 'data/sunday.json',
    'emotional-intelligence': 'data/emotional-intelligence.json',
    'gospel-questions': 'data/gospel-questions.json',
    'pe-foundations': 'data/pe-foundations.json',
    'pe-mechanics': 'data/pe-mechanics.json',
    'pe-mastery': 'data/pe-mastery.json',
    'drugdev-foundations': 'data/drugdev-foundations.json',
    'drugdev-mechanics': 'data/drugdev-mechanics.json',
    'drugdev-mastery': 'data/drugdev-mastery.json',
    'lifesci-foundations': 'data/lifesci-foundations.json',
    'lifesci-mechanics': 'data/lifesci-mechanics.json',
    'lifesci-mastery': 'data/lifesci-mastery.json'
  };

  const PRO_DECKS = {
    'pe-foundations':      { emoji: '💰', label: 'PE FOUND',        desc: 'Private equity fundamentals' },
    'pe-mechanics':        { emoji: '⚙️', label: 'PE MECH',         desc: 'PE deal mechanics & processes' },
    'pe-mastery':          { emoji: '🎯', label: 'PE MASTER',       desc: 'PE strategy & judgment calls' },
    'drugdev-foundations':  { emoji: '💊', label: 'DRUG DEV',       desc: 'Drug development foundations' },
    'drugdev-mechanics':    { emoji: '⚙️', label: 'DRUG MECH',      desc: 'Drug development processes' },
    'drugdev-mastery':      { emoji: '🎯', label: 'DRUG MASTER',    desc: 'Advanced drug dev strategy' },
    'lifesci-foundations':  { emoji: '🧬', label: 'LIFESCI',        desc: 'Life sciences business fundamentals' },
    'lifesci-mechanics':    { emoji: '⚙️', label: 'LIFESCI MECH',   desc: 'Life sciences processes & frameworks' },
    'lifesci-mastery':      { emoji: '🎯', label: 'LIFESCI MASTER', desc: 'Life sciences strategic leadership' }
  };

  function isProDeck(deckId) {
    return deckId in PRO_DECKS;
  }

  function hasProDeckSelected() {
    return selectedDeckIds.some(id => isProDeck(id));
  }

  function getEnabledProDecks() {
    try { return JSON.parse(localStorage.getItem('tt_pro_decks') || '[]'); } catch { return []; }
  }

  function setEnabledProDecks(ids) {
    localStorage.setItem('tt_pro_decks', JSON.stringify(ids));
  }

  const TEAM_COLORS = ['cyan', 'pink', 'yellow', 'green'];

  // ─── Screen Navigation ───

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  // ─── Initialize ───

  async function init() {
    // Mute button logic
    let muted = localStorage.getItem('tt_muted') === 'true';
    function updateMuteBtn() {
      const btn = document.getElementById('btn-mute');
      if (btn) btn.textContent = muted ? '🔇' : '🔊';
    }
    document.getElementById('btn-mute').addEventListener('click', () => {
      muted = !muted;
      localStorage.setItem('tt_muted', muted);
      Sound.setMuted(muted);
      updateMuteBtn();
    });
    Sound.setMuted(muted);
    updateMuteBtn();
    // Load default deck data
    await loadDecks(selectedDeckIds);

    // Initialize cloud sync (non-blocking)
    CloudSync.init().then(() => renderHomeLeaderboard());

    // Wire up home screen
    document.getElementById('btn-press-start').addEventListener('click', () => {
      Sound.startMusic();
      openSetup();
    });
    document.getElementById('btn-players-home').addEventListener('click', () => {
      Sound.startMusic();
      openSetup();
    });

    // Wire up setup screen
    document.getElementById('btn-add-player').addEventListener('click', () => Players.showAddPlayerModal());
    document.getElementById('btn-save-player').addEventListener('click', handleSavePlayer);
    document.getElementById('btn-cancel-player').addEventListener('click', () => Players.hideAddPlayerModal());
    document.getElementById('btn-start-game').addEventListener('click', handleStartGame);

    // Wire edit player modal
    document.getElementById('btn-save-edit').addEventListener('click', () => {
      if (Players.saveEditPlayerFromModal()) {
        Players.hideEditPlayerModal();
      }
    });
    document.getElementById('btn-cancel-edit').addEventListener('click', () => Players.hideEditPlayerModal());

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
        tutorModeActive = (selectedGameMode === 'tutor');
        // Hide grid/team options in Tutor mode (they don't apply)
        document.getElementById('team-section').style.display = tutorModeActive ? 'none' : '';
        document.querySelector('.grid-section').style.display = tutorModeActive ? 'none' : '';
        document.querySelector('.timer-toggles').style.display = tutorModeActive ? 'none' : '';
      });
    });

    // Wire timer toggles
    document.getElementById('toggle-timer-tier1').addEventListener('change', (e) => {
      timerOffTier1 = e.target.checked;
    });
    document.getElementById('toggle-timer-all').addEventListener('change', (e) => {
      timerOffAll = e.target.checked;
    });

    // Wire deck selectors (multi-select toggle)
    document.querySelectorAll('.deck-option').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.classList.toggle('selected');
        selectedDeckIds = [...document.querySelectorAll('.deck-option.selected')].map(b => b.dataset.deck);
        // Must have at least one deck
        if (selectedDeckIds.length === 0) {
          btn.classList.add('selected');
          selectedDeckIds = [btn.dataset.deck];
        }
        await loadDecks(selectedDeckIds);
        updateModeLabels();
      });
    });

    // Render any admin-unlocked pro decks in deck selector
    renderProDeckSelector();

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

    // Wire tutor mode events
    wireTutorEvents();

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

  async function loadDeck(deckId) {
    const resp = await fetch(DECK_FILES[deckId]);
    deckData = await resp.json();
  }

  async function loadDecks(deckIds) {
    if (deckIds.length === 1) {
      await loadDeck(deckIds[0]);
      return;
    }
    // Combine multiple decks
    const allCards = [];
    let combinedName = [];
    for (const id of deckIds) {
      const resp = await fetch(DECK_FILES[id]);
      const d = await resp.json();
      allCards.push(...d.cards);
      combinedName.push(d.name || id);
    }
    deckData = {
      deckId: 'combined',
      name: combinedName.join(' + '),
      cards: allCards
    };
  }

  function updateModeLabels() {
    const single = selectedDeckIds.length === 1;
    const isSunday = single && (selectedDeckIds[0] === 'sunday' || selectedDeckIds[0] === 'gospel-questions');
    const isEQ = single && selectedDeckIds[0] === 'emotional-intelligence';
    const isPro = single && isProDeck(selectedDeckIds[0]);
    const isBias = single && selectedDeckIds[0] === 'cognitive-biases';
    const word = isSunday ? 'principle' : isEQ ? 'skill' : isBias ? 'bias' : 'concept';
    const labels = {
      classic: `Read scenario, name the ${word}`,
      define: `See the ${word}, pick its meaning`,
      spot: 'See description, find the scenario',
      mixed: 'Random mode every card'
    };
    document.querySelectorAll('.mode-option').forEach(btn => {
      const desc = btn.querySelector('.mode-desc');
      if (desc && labels[btn.dataset.mode]) desc.textContent = labels[btn.dataset.mode];
    });
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
    selectedTeams = null;
    showScreen('setup-screen');
    Players.renderPlayerList(document.getElementById('player-list-container'), (ids) => {
      selectedPlayerIds = ids;
      updateTeamOptions();
    });
    // Default grid size selection
    document.querySelectorAll('.grid-option').forEach(b => b.classList.remove('selected'));
    const defaultBtn = document.querySelector(`.grid-option[data-size="${selectedGridSize}"]`);
    if (defaultBtn) defaultBtn.classList.add('selected');

    // Default mode selection
    document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('selected'));
    const defaultMode = document.querySelector(`.mode-option[data-mode="${selectedGameMode}"]`);
    if (defaultMode) defaultMode.classList.add('selected');

    // Default deck selection (multi-select)
    document.querySelectorAll('.deck-option').forEach(b => b.classList.remove('selected'));
    renderProDeckSelector();
    selectedDeckIds.forEach(id => {
      const deckBtn = document.querySelector(`.deck-option[data-deck="${id}"]`);
      if (deckBtn) deckBtn.classList.add('selected');
    });
    updateModeLabels();
    updateTeamOptions();
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
        updateTeamOptions();
      });
    }
  }

  // ─── Team Selection ───

  function updateTeamOptions() {
    const section = document.getElementById('team-section');
    const container = document.getElementById('team-options');
    const count = selectedPlayerIds.length;

    // Always show team section when 2+ players selected
    if (count < 2) {
      section.style.display = 'none';
      selectedTeams = null;
      return;
    }

    section.style.display = '';
    container.innerHTML = '';

    // "No teams" option — always available
    const noTeamBtn = document.createElement('button');
    noTeamBtn.className = 'team-option selected';
    noTeamBtn.dataset.teams = '0';
    noTeamBtn.textContent = 'FREE FOR ALL';
    noTeamBtn.addEventListener('click', () => {
      document.querySelectorAll('.team-option').forEach(b => b.classList.remove('selected'));
      noTeamBtn.classList.add('selected');
      selectedTeams = null;
    });
    container.appendChild(noTeamBtn);

    // Show team configs for 2, 3, 4 teams — enable only valid divisors
    const possibleTeamCounts = [2, 3, 4];
    possibleTeamCounts.forEach(numTeams => {
      if (numTeams > count) return; // can't have more teams than players
      const valid = count % numTeams === 0 && (count / numTeams) >= 1;
      const playersPerTeam = valid ? count / numTeams : '?';
      const btn = document.createElement('button');
      btn.className = 'team-option' + (valid ? '' : ' team-disabled');
      btn.dataset.teams = numTeams;
      btn.textContent = valid
        ? `${numTeams} TEAMS (${playersPerTeam}v${playersPerTeam})`
        : `${numTeams} TEAMS`;
      if (valid) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.team-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          buildTeams(numTeams);
        });
      }
      container.appendChild(btn);
    });
  }

  function buildTeams(numTeams) {
    const players = Players.getPlayersById(selectedPlayerIds);
    const perTeam = Math.floor(players.length / numTeams);
    // Shuffle players for random team assignment
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const teams = [];
    for (let t = 0; t < numTeams; t++) {
      teams.push({
        name: `TEAM ${t + 1}`,
        color: TEAM_COLORS[t % TEAM_COLORS.length],
        playerIds: shuffled.slice(t * perTeam, (t + 1) * perTeam).map(p => p.id)
      });
    }
    selectedTeams = teams;
  }

  // ─── Start Game ───

  async function handleStartGame() {
    if (selectedPlayerIds.length < 1) return;

    const players = Players.getPlayersById(selectedPlayerIds);
    const totalCards = selectedGridSize * selectedGridSize;

    // Load/combine selected decks
    await loadDecks(selectedDeckIds);

    // Check if we have enough bias content
    if (!deckData || deckData.cards.length === 0) return;

    if (selectedGameMode === 'tutor') {
      tutorModeActive = true;
      clearTutorChat();
      showScreen('tutor-mode-screen');
      // Send welcome message from AI
      addAiMessage('Hey there, challenger! \ud83d\udd79\ufe0f Welcome to Brain Coach mode! I\'m here to help you level up your thinking skills. Ask me about any bias or concept, tap \ud83c\udfb2 RANDOM TOPIC for a surprise lesson, or browse the concept library. Let\'s go! \ud83e\udde0');
      return;
    } else {
      tutorModeActive = false;
    }

    Game.init(players, selectedGridSize, deckData, selectedGameMode, selectedTeams);
    Sound.stopMusic();
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
        if (card.tttBonus) cardEl.classList.add('ttt-bonus');
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
              <span class="bias-name">???</span>
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

    // Team scores header
    if (gs.teams) {
      const teamScores = Game.getTeamScores();
      if (teamScores) {
        const teamRow = document.createElement('div');
        teamRow.className = 'sb-teams';
        teamScores.forEach(t => {
          teamRow.innerHTML += `<span class="sb-team glow-${t.color}">${t.name}: ${padScore(t.score)}</span>`;
        });
        sb.appendChild(teamRow);
      }
    }

    gs.players.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'sb-player' + (i === gs.currentTurnIndex ? ' active-turn' : '');
      const crown = gs.leaderId === p.id ? '<span class="crown-icon">👑</span>' : '';
      const streakBadge = p.streak >= 2 ? `<span class="sb-streak glow-yellow">🔥${p.streak}</span>` : '';
      div.innerHTML = `${crown}${Players.iconHTML(p)} ${sanitize(p.name)} ${streakBadge}<span class="sb-score">${padScore(p.sessionScore)}</span>`;
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

    // Show team info on pass screen
    let teamText = '';
    if (gs.teams) {
      const team = gs.teams.find(t => t.playerIds.includes(cp.id));
      if (team) teamText = `<br><span class="glow-${team.color}" style="font-size:10px;">${team.name}</span>`;
    }

    document.getElementById('pass-name').innerHTML = `PASS TO ${sanitize(cp.name.toUpperCase())}${teamText}`;
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

    // Show rarity badge (only revealed now — not before flip)
    const rarityBadge = document.getElementById('challenge-rarity-badge');
    if (cardData.rarity && cardData.rarity !== 'normal') {
      rarityBadge.style.display = 'block';
      if (cardData.rarity === 'rare') {
        rarityBadge.textContent = '✧ RARE — 2× POINTS! ✧';
        rarityBadge.className = 'rarity-badge rarity-rare';
        Sound.play('doublepoints');
      } else if (cardData.rarity === 'wild') {
        rarityBadge.textContent = '★ WILD CARD ★';
        rarityBadge.className = 'rarity-badge rarity-wild';
        Sound.play('wildcard');
      } else if (cardData.rarity === 'sabotage') {
        rarityBadge.textContent = '☠ SABOTAGE — HARDER TIER! ☠';
        rarityBadge.className = 'rarity-badge rarity-sabotage';
        Sound.play('sabotage');
      }
    } else {
      rarityBadge.style.display = 'none';
    }

    // Show tier/difficulty label
    const tierLabel = ['', 'EASY', 'MEDIUM', 'HARD'][cardData.tier] || '';
    const tierEl = document.getElementById('challenge-tier-label');
    tierEl.textContent = isSteal ? `⚡ STEAL · ${tierLabel}` : tierLabel;
    tierEl.className = `tier-label tier-${cardData.tier}`;

    // Store bias name for post-answer reveal
    biasNameEl.dataset.answer = cardData.biasName;

    // Mode-specific layout
    if (mode === 'define') {
      biasNameEl.textContent = cardData.biasName;
      definitionEl.textContent = '';
      definitionEl.style.display = 'none';
      scenarioEl.textContent = '';
      scenarioEl.style.display = 'none';
    } else if (mode === 'spot') {
      biasNameEl.textContent = '? ? ?';
      definitionEl.textContent = cardData.definition;
      definitionEl.style.display = '';
      scenarioEl.textContent = '';
      scenarioEl.style.display = 'none';
    } else {
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

    // Show skip button (only for non-steal turns)
    const skipBtn = document.getElementById('btn-challenge-skip');
    skipBtn.style.display = isSteal ? 'none' : '';
    skipBtn.onclick = () => handleSkipCard(cardIndex);

    // Start timer
    startTimer(cardData, cardIndex, isSteal);
  }

  // ─── Timer ───

  function startTimer(cardData, cardIndex, isSteal) {
    stopTimer();
    // Timer logic respects toggles
    let skipTimer = false;
    if (timerOffAll) skipTimer = true;
    if (timerOffTier1 && cardData.tier === 1) skipTimer = true;
    if (skipTimer) {
      const container = document.getElementById('timer-bar-container');
      if (container) container.style.display = 'none';
      return;
    }
    const cp = Game.getCurrentPlayer();
    timerSeconds = Game.getTimerDuration(cp);
    const totalTime = timerSeconds;
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    const container = document.getElementById('timer-bar-container');
    container.style.display = '';
    timerBar.style.width = '100%';
    timerBar.className = 'timer-bar';
    timerText.textContent = timerSeconds;

    timerInterval = setInterval(() => {
      timerSeconds--;
      timerText.textContent = Math.max(0, timerSeconds);
      const pct = (timerSeconds / totalTime) * 100;
      timerBar.style.width = pct + '%';

      if (timerSeconds <= 10 && timerSeconds > 0) {
        timerBar.className = 'timer-bar timer-urgent';
        Sound.play('tickUrgent');
      } else if (timerSeconds > 10) {
        Sound.play('tick');
      }

      if (timerSeconds <= 0) {
        stopTimer();
        Sound.play('timeout');
        // Time's up — treat as wrong answer
        handleChallengeAnswer(cardIndex, -1, cardData, isSteal);
      }
    }, 1000);
  }
  // ─── Tutor Mode Chat Logic ───

  let tutorChatHistory = []; // conversation context for AI

  function clearTutorChat() {
    const chatList = document.getElementById('tutor-chat-list');
    if (chatList) chatList.innerHTML = '';
    tutorChatHistory = [];
  }

  function addAiMessage(text) {
    const chatList = document.getElementById('tutor-chat-list');
    if (!chatList) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg ai';
    msg.innerHTML = `<span class="chat-bubble">${sanitize(text)}</span>`;
    chatList.appendChild(msg);
    scrollChat();
    tutorChatHistory.push({ role: 'assistant', content: text });
  }

  function scrollChat() {
    const container = document.querySelector('.tutor-chat-container');
    if (container) setTimeout(() => container.scrollTop = container.scrollHeight, 50);
  }

  function offlineBrainCoach(message) {
    const m = message.toLowerCase();
    if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
      return 'Hey there, challenger! \ud83d\udd79\ufe0f Welcome to Brain Coach mode. I\u2019m here to help you level up your thinking skills. Ask me about any bias, concept, or say "random topic"!';
    if (m.includes('bias') || m.includes('thinking trap'))
      return 'Great question! Cognitive biases are mental shortcuts our brains take that can lead us astray \u2014 like glitches in our mental software. Totally normal, but worth spotting! Want me to quiz you on one? \ud83e\udde0';
    if (m.includes('random') || m.includes('topic') || m.includes('teach')) {
      const topics = [
        'Let\u2019s talk about Confirmation Bias \u2014 we tend to seek info that confirms what we already believe. Ever noticed yourself doing that?',
        'How about the Dunning-Kruger Effect? People with limited knowledge sometimes overestimate their ability. The cure? Stay curious! \ud83d\udcda',
        'The Anchoring Effect! The first number you hear in a negotiation tends to "anchor" your thinking. Watch for it next time you\u2019re shopping!',
        'The Sunk Cost Fallacy \u2014 ever kept watching a bad movie just because you already paid for the ticket? That\u2019s this bias! \ud83c\udfac',
        'Emotional Intelligence \u2014 it\u2019s not just about being smart, it\u2019s about understanding and managing your emotions AND recognizing them in others.'
      ];
      return topics[Math.floor(Math.random() * topics.length)];
    }
    if (m.includes('correct') || m.includes('right') || m.includes('got it'))
      return 'Nice work, champion! \ud83c\udfc6 Knowledge is your ultimate power-up. Want to explore another concept or go deeper on this one?';
    if (m.includes('wrong') || m.includes('missed') || m.includes('incorrect'))
      return 'No worries \u2014 every miss is a chance to level up! The fact that you\u2019re here learning puts you ahead. Want me to break that one down? \ud83d\udcaa';
    return 'Interesting thought! I\u2019m best at helping with cognitive biases, thinking traps, emotional intelligence, and critical thinking. Try asking about a specific concept, or say "random topic" for a surprise lesson! \ud83c\udfae';
  }

  async function sendTutorMessage(overrideMsg) {
    const input = document.getElementById('tutor-chat-input');
    const chatList = document.getElementById('tutor-chat-list');
    const msg = overrideMsg || (input ? input.value.trim() : '');
    if (!msg) return;
    if (input && !overrideMsg) input.value = '';

    // Add user message to chat
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.innerHTML = `<span class="chat-bubble">${sanitize(msg)}</span>`;
    chatList.appendChild(userMsg);
    scrollChat();
    tutorChatHistory.push({ role: 'user', content: msg });

    // Show AI thinking
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-msg ai';
    aiMsg.innerHTML = `<span class="chat-bubble thinking">\ud83e\udd16 ...</span>`;
    chatList.appendChild(aiMsg);
    scrollChat();

    // Call backend API with conversation context
    let reply;
    try {
      const apiUrl = window.THINK_TWICE_API || '';
      const resp = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: tutorChatHistory.slice(-10) })
      });
      const data = await resp.json();
      reply = data.reply || '...';
    } catch (_) {
      reply = offlineBrainCoach(msg);
    }
    aiMsg.innerHTML = `<span class="chat-bubble">${sanitize(reply)}</span>`;
    aiMsg.querySelector('.chat-bubble').classList.remove('thinking');
    tutorChatHistory.push({ role: 'assistant', content: reply });
    scrollChat();
  }

  // ─── Concept Browser ───

  function openConceptBrowser() {
    const modal = document.getElementById('concept-browser-modal');
    const list = document.getElementById('concept-list');
    const search = document.getElementById('concept-search');
    modal.classList.add('active');
    search.value = '';
    renderConceptList('');
    search.focus();
    search.oninput = () => renderConceptList(search.value);
  }

  function renderConceptList(filter) {
    const list = document.getElementById('concept-list');
    if (!deckData || !deckData.cards) { list.innerHTML = '<p style="color:var(--text-dim)">No deck loaded</p>'; return; }
    const f = filter.toLowerCase();
    const matches = deckData.cards.filter(c => !f || c.name.toLowerCase().includes(f));
    list.innerHTML = '';
    matches.slice(0, 50).forEach(card => {
      const item = document.createElement('div');
      item.className = 'concept-item';
      const desc = card.tiers && card.tiers['1'] ? card.tiers['1'].definition : '';
      item.innerHTML = `<span class="concept-name">${sanitize(card.name)}</span>${desc ? '<br>' + sanitize(desc.substring(0, 80)) + (desc.length > 80 ? '...' : '') : ''}`;
      item.addEventListener('click', () => {
        document.getElementById('concept-browser-modal').classList.remove('active');
        sendTutorMessage(`Tell me about: ${card.name}`);
      });
      list.appendChild(item);
    });
    if (matches.length === 0) list.innerHTML = '<p style="color:var(--text-dim)">No matches</p>';
  }

  function getRandomConcept() {
    if (!deckData || !deckData.cards || deckData.cards.length === 0) return null;
    return deckData.cards[Math.floor(Math.random() * deckData.cards.length)];
  }

  // Wire tutor mode events (called once at init)
  function wireTutorEvents() {
    document.getElementById('tutor-chat-send').addEventListener('click', () => sendTutorMessage());
    document.getElementById('tutor-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendTutorMessage();
    });
    document.getElementById('btn-tutor-home').addEventListener('click', () => {
      tutorModeActive = false;
      renderHomeLeaderboard();
      showScreen('home-screen');
    });
    document.getElementById('btn-tutor-random').addEventListener('click', () => {
      const concept = getRandomConcept();
      if (concept) sendTutorMessage(`Tell me about: ${concept.name}`);
      else sendTutorMessage('Give me a random topic!');
    });
    document.getElementById('btn-tutor-browse').addEventListener('click', openConceptBrowser);
    document.getElementById('btn-close-concepts').addEventListener('click', () => {
      document.getElementById('concept-browser-modal').classList.remove('active');
    });
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const container = document.getElementById('timer-bar-container');
    if (container) container.style.display = 'none';
  }

  function handleChallengeAnswer(cardIndex, selectedIndex, cardData, isSteal) {
    stopTimer();
    // Hide skip button once an answer is submitted
    document.getElementById('btn-challenge-skip').style.display = 'none';
    let result;

    if (isSteal) {
      result = Game.attemptSteal(selectedIndex, cardData.challenge);
    } else {
      result = Game.answerChallenge(cardIndex, selectedIndex, cardData.challenge);
    }

    // Disable all options
    document.querySelectorAll('.challenge-option').forEach(btn => btn.classList.add('disabled'));

    // Highlight answer feedback
    const options = document.querySelectorAll('.challenge-option');
    const correctIndex = cardData.challenge.correct;
    if (result.correct) {
      // Show correct highlight only when they got it right
      if (options[correctIndex]) options[correctIndex].classList.add('correct');
    } else if (selectedIndex >= 0 && options[selectedIndex]) {
      // Only mark their wrong pick — do NOT reveal the correct answer
      options[selectedIndex].classList.add('wrong');
    }

    // Tutor mode: send summary to chat after answer
    if (tutorModeActive) {
      let summary = '';
      if (typeof cardData.challenge.options !== 'undefined') {
        const picked = selectedIndex >= 0 ? cardData.challenge.options[selectedIndex] : '(no answer)';
        const correct = cardData.challenge.options[cardData.challenge.correct];
        summary = result.correct
          ? `I answered: "${picked}". It was correct!`
          : `I answered: "${picked}". The correct answer was: "${correct}".`;
      } else {
        summary = result.correct ? 'I got it right!' : 'I missed it.';
      }
      sendTutorMessage(summary);
    }

    // ...existing code...

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

    // Show tip
    const tipReveal = document.getElementById('tip-reveal');
    tipReveal.className = 'tip-reveal show';
    const gs2 = Game.getState();
    const tipIsBias = gs2.deckData && gs2.deckData.deckId === 'cognitive-biases';
    document.getElementById('tip-label').textContent = tipIsBias ? '🛡 HOW TO AVOID IT' : '💡 PRO TIP';
    document.getElementById('tip-text').textContent = cardData.tip || '';

    // Scroll challenge box to show tip and next button
    const challengeBox = document.querySelector('.challenge-box');
    setTimeout(() => challengeBox.scrollTo({ top: challengeBox.scrollHeight, behavior: 'smooth' }), 150);

    // Show next button or steal option
    if (isSteal && result.correct) {
      // Successful steal — award points, then give stealer a bonus turn
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndBonusTurn(result, cardIndex);
      };
    } else if (result.correct) {
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndAdvance(result, cardIndex);
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
        closeChallengeAndAdvance({ correct: false, gameOver: false }, cardIndex);
      };
    } else if (isSteal) {
      // Everyone missed — move on
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('steal-section').style.display = 'none';
      document.getElementById('btn-challenge-next').onclick = () => {
        closeChallengeAndAdvance(result, cardIndex);
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
        closeChallengeAndAdvance({ correct: false, gameOver: false }, cardIndex);
      };
    } else {
      document.getElementById('btn-challenge-next').style.display = 'block';
      document.getElementById('btn-challenge-next').onclick = () => {
        Game.skipSteal();
        closeChallengeAndAdvance(result, cardIndex);
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

  // ─── Streak & Crown Effects ───

  function showStreakBanner(streak, player) {
    const banner = document.getElementById('streak-banner');
    banner.style.display = 'block';
    banner.className = 'streak-banner glow-yellow streak-animate';
    banner.innerHTML = `🔥 ${sanitize(player.name.toUpperCase())} — ${streak} STREAK! 🔥`;
    setTimeout(() => {
      banner.style.display = 'none';
      banner.classList.remove('streak-animate');
    }, 2500);
  }

  function showDethroneAnimation(oldLeader, newLeader) {
    const overlay = document.getElementById('dethrone-overlay');
    const detail = document.getElementById('dethrone-detail');
    detail.innerHTML = `${Players.iconHTML(newLeader)} ${sanitize(newLeader.name.toUpperCase())} TAKES THE 👑 FROM ${Players.iconHTML(oldLeader)} ${sanitize(oldLeader.name.toUpperCase())}!`;
    overlay.style.display = 'flex';
    overlay.className = 'dethrone-overlay dethrone-animate';
    Sound.play('dethrone');
    setTimeout(() => {
      Sound.play('crown');
    }, 500);
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('dethrone-animate');
    }, 3000);
  }

  // ─── Confetti/Particles ───

  function spawnParticles(count, color) {
    const container = document.getElementById('game-screen');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = (30 + Math.random() * 40) + '%';
      p.style.setProperty('--hue', color || Math.floor(Math.random() * 360));
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      container.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  function handleSkipCard(cardIndex) {
    stopTimer();
    Game.skipCard(cardIndex);
    closeChallenge();
    // Flip card element back
    const cardEl = document.querySelector(`.card[data-index="${cardIndex}"]`);
    if (cardEl) cardEl.classList.remove('flipped');
    Game.advanceTurn();
    showPassScreen();
  }

  function closeChallenge() {
    stopTimer();
    document.getElementById('btn-challenge-skip').style.display = 'none';
    document.getElementById('challenge-overlay').classList.remove('active');
  }

  function closeChallengeAndAdvance(result, cardIndex) {
    closeChallenge();

    // Check for tic-tac-toe bonus after correct answer
    if (result.correct && cardIndex !== undefined) {
      const ttt = Game.checkTTTBonus(cardIndex, result.player.id);
      if (ttt) {
        renderGameBoard();
        Sound.play('goagain');
        // Flash bonus cards gold
        ttt.bonusCardIndices.forEach(idx => {
          const el = document.querySelector(`.card[data-index="${idx}"]`);
          if (el) el.classList.add('ttt-bonus');
        });
        // Show bonus banner
        const banner = document.getElementById('turn-banner');
        banner.innerHTML = `★ ROW BONUS! +${ttt.bonusPoints} PTS ★`;
        banner.classList.add('glow-yellow');
        renderScoreboard();
        setTimeout(() => {
          if (result.gameOver || Game.isGameOver()) { endGame(); return; }
          Game.advanceTurn();
          showPassScreen();
        }, 2000);
        return;
      }
    }

    renderGameBoard();

    if (result.gameOver || Game.isGameOver()) {
      endGame();
      return;
    }

    // Always advance turn after answering (one card per turn)
    Game.advanceTurn();
    showPassScreen();
  }

  function closeChallengeAndBonusTurn(result, cardIndex) {
    closeChallenge();

    // Check for tic-tac-toe bonus on the stolen card
    if (cardIndex !== undefined) {
      const ttt = Game.checkTTTBonus(cardIndex, result.player.id);
      if (ttt) {
        renderGameBoard();
        Sound.play('goagain');
        ttt.bonusCardIndices.forEach(idx => {
          const el = document.querySelector(`.card[data-index="${idx}"]`);
          if (el) el.classList.add('ttt-bonus');
        });
        const banner = document.getElementById('turn-banner');
        banner.innerHTML = `★ ROW BONUS! +${ttt.bonusPoints} PTS ★`;
        banner.classList.add('glow-yellow');
        renderScoreboard();
        setTimeout(() => {
          if (result.gameOver || Game.isGameOver()) { endGame(); return; }
          // Show bonus turn banner — stealer picks another card
          showBonusTurnBanner();
        }, 2000);
        return;
      }
    }

    if (result.gameOver || Game.isGameOver()) {
      renderGameBoard();
      endGame();
      return;
    }

    // Stealer gets a bonus turn — show the board with a banner
    showBonusTurnBanner();
  }

  function showBonusTurnBanner() {
    renderGameBoard();
    const banner = document.getElementById('turn-banner');
    const cp = Game.getCurrentPlayer();
    banner.innerHTML = `⚡ STOLEN! ${Players.iconHTML(cp)} ${sanitize(cp.name.toUpperCase())} — PICK YOUR CARD! ⚡`;
    banner.className = 'turn-banner glow-green';
    Sound.play('steal');
    showScreen('game-screen');
  }

  // ─── Game Over ───

  function endGame() {
    stopTimer();
    Sound.play('gameover');
    Sound.startMusic();
    Game.finalizeScores();
    const { sortedPlayers, biasesSeen } = Game.getResults();
    const gs = Game.getState();
    const isSunday = gs.deckData && (gs.deckData.deckId === 'sunday' || gs.deckData.deckId === 'gospel-questions');
    const isEQ = gs.deckData && gs.deckData.deckId === 'emotional-intelligence';
    const isCombined = gs.deckData && gs.deckData.deckId === 'combined';
    const isProGame = gs.deckData && isProDeck(gs.deckData.deckId);
    document.getElementById('gameover-biases-heading').textContent =
      isCombined ? 'TOPICS ENCOUNTERED'
      : isSunday ? 'PRINCIPLES ENCOUNTERED'
      : isEQ ? 'EQ SKILLS ENCOUNTERED'
      : isProGame ? 'CONCEPTS ENCOUNTERED'
      : 'BIASES ENCOUNTERED';

    // Push each player's score to cloud
    sortedPlayers.forEach(p => {
      CloudSync.pushScore(p.id, p.sessionScore, gs.gameMode || 'classic');
    });

    document.getElementById('gameover-winner-text').innerHTML =
      `WINNER: ${Players.iconHTML(sortedPlayers[0])} ${sanitize(sortedPlayers[0].name.toUpperCase())}`;

    // Show team results if in team mode
    const teamScores = Game.getTeamScores();
    const scoresContainer = document.getElementById('gameover-scores');
    scoresContainer.innerHTML = '';

    if (teamScores) {
      const sortedTeams = [...teamScores].sort((a, b) => b.score - a.score);
      sortedTeams.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'gameover-row';
        row.innerHTML = `<span class="go-name glow-${t.color}">${i === 0 ? '👑 ' : ''}${t.name}</span><span class="go-score">${padScore(t.score)}</span>`;
        scoresContainer.appendChild(row);
      });
      // Separator
      const sep = document.createElement('div');
      sep.style.cssText = 'border-top:1px solid var(--text-dim); margin:8px 0;';
      scoresContainer.appendChild(sep);
    }

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
      gs.gameMode,
      gs.teams
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
      renderAdminProDecks();
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
    renderProDeckSelector(); // refresh setup screen when admin closes
  }

  function renderAdminProDecks() {
    const container = document.getElementById('admin-pro-decks');
    const enabled = getEnabledProDecks();
    container.innerHTML = '';
    Object.entries(PRO_DECKS).forEach(([deckId, info]) => {
      const row = document.createElement('div');
      row.className = 'admin-player-row';
      const active = enabled.includes(deckId);
      row.innerHTML = `
        <div class="info">
          <span>${info.emoji} ${info.label}</span>
        </div>
      `;
      const toggleBtn = document.createElement('button');
      toggleBtn.className = active ? 'admin-toggle active' : 'admin-toggle';
      toggleBtn.textContent = active ? 'ON' : 'OFF';
      toggleBtn.addEventListener('click', () => {
        const current = getEnabledProDecks();
        if (current.includes(deckId)) {
          setEnabledProDecks(current.filter(id => id !== deckId));
          toggleBtn.textContent = 'OFF';
          toggleBtn.className = 'admin-toggle';
        } else {
          current.push(deckId);
          setEnabledProDecks(current);
          toggleBtn.textContent = 'ON';
          toggleBtn.className = 'admin-toggle active';
        }
      });
      row.appendChild(toggleBtn);
      container.appendChild(row);
    });
  }

  function renderProDeckSelector() {
    const container = document.getElementById('pro-deck-selector');
    const enabled = getEnabledProDecks();
    container.innerHTML = '';
    if (enabled.length === 0) {
      container.style.display = 'none';
      // Deselect any pro decks that may have been selected
      selectedDeckIds = selectedDeckIds.filter(id => !isProDeck(id));
      if (selectedDeckIds.length === 0) selectedDeckIds = ['cognitive-biases'];
      return;
    }
    container.style.display = '';
    enabled.forEach(deckId => {
      const info = PRO_DECKS[deckId];
      if (!info) return;
      const btn = document.createElement('button');
      btn.className = 'deck-option';
      btn.dataset.deck = deckId;
      btn.innerHTML = `<span class=\"deck-name\">${info.emoji} ${info.label}</span><span class=\"deck-desc\">${info.desc}</span>`;
      btn.addEventListener('click', async () => {
        btn.classList.toggle('selected');
        selectedDeckIds = [...document.querySelectorAll('.deck-option.selected')].map(b => b.dataset.deck);
        if (selectedDeckIds.length === 0) {
          btn.classList.add('selected');
          selectedDeckIds = [btn.dataset.deck];
        }
        await loadDecks(selectedDeckIds);
        updateModeLabels();
      });
      container.appendChild(btn);
    });
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
        renderAdminProDecks();
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
