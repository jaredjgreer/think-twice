/* ═══════════════════════════════════════════
   THINK TWICE — Storage Module
   Handles LocalStorage persistence for
   players, leaderboard, and game state.
   ═══════════════════════════════════════════ */

const Storage = (() => {
  const KEYS = {
    PLAYERS: 'tt_players',
    LEADERBOARD: 'tt_leaderboard',
    GAME_STATE: 'tt_game_state',
    ADMIN_PIN: 'tt_admin_pin'
  };

  function getAdminPin() {
    return localStorage.getItem(KEYS.ADMIN_PIN);
  }

  function setAdminPin(pin) {
    localStorage.setItem(KEYS.ADMIN_PIN, pin);
  }

  function getPlayers() {
    const raw = localStorage.getItem(KEYS.PLAYERS);
    return raw ? JSON.parse(raw) : [];
  }

  function savePlayers(players) {
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
  }

  function addPlayer(player) {
    const players = getPlayers();
    player.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    players.push(player);
    savePlayers(players);
    // Initialize leaderboard entry
    const lb = getLeaderboard();
    lb[player.id] = { name: player.name, emoji: player.icon || player.emoji, icon: player.icon, iconColor: player.iconColor, totalPoints: 0, gamesPlayed: 0, bestGame: 0 };
    saveLeaderboard(lb);
    return player;
  }

  function deletePlayer(playerId) {
    let players = getPlayers();
    players = players.filter(p => p.id !== playerId);
    savePlayers(players);
    const lb = getLeaderboard();
    delete lb[playerId];
    saveLeaderboard(lb);
  }

  function importCloudPlayer(cloudPlayer) {
    const players = getPlayers();
    if (players.some(p => p.id === cloudPlayer.id)) return;
    players.push({
      id: cloudPlayer.id,
      name: cloudPlayer.name,
      icon: cloudPlayer.icon || '★',
      iconColor: cloudPlayer.iconColor || 'cyan',
      birthMonth: null,
      birthYear: null,
      age: null
    });
    savePlayers(players);
    const lb = getLeaderboard();
    if (!lb[cloudPlayer.id]) {
      lb[cloudPlayer.id] = {
        name: cloudPlayer.name,
        icon: cloudPlayer.icon || '★',
        iconColor: cloudPlayer.iconColor || 'cyan',
        totalPoints: cloudPlayer.totalPoints || 0,
        gamesPlayed: cloudPlayer.gamesPlayed || 0,
        bestGame: cloudPlayer.bestGame || 0
      };
      saveLeaderboard(lb);
    }
  }

  function getLeaderboard() {
    const raw = localStorage.getItem(KEYS.LEADERBOARD);
    return raw ? JSON.parse(raw) : {};
  }

  function saveLeaderboard(lb) {
    localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(lb));
  }

  function updateLeaderboard(playerId, sessionScore) {
    const lb = getLeaderboard();
    if (!lb[playerId]) return;
    lb[playerId].totalPoints += sessionScore;
    lb[playerId].gamesPlayed += 1;
    if (sessionScore > lb[playerId].bestGame) {
      lb[playerId].bestGame = sessionScore;
    }
    saveLeaderboard(lb);
  }

  function getLeaderboardSorted() {
    const lb = getLeaderboard();
    return Object.entries(lb)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

  function exportData() {
    return JSON.stringify({
      players: getPlayers(),
      leaderboard: getLeaderboard(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  function importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.players) savePlayers(data.players);
    if (data.leaderboard) saveLeaderboard(data.leaderboard);
  }

  function saveGameState(gameState) {
    localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(gameState));
  }

  function getGameState() {
    try {
      const raw = localStorage.getItem(KEYS.GAME_STATE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearGameState() {
    localStorage.removeItem(KEYS.GAME_STATE);
  }

  return {
    getPlayers,
    savePlayers,
    addPlayer,
    deletePlayer,
    importCloudPlayer,
    getLeaderboard,
    updateLeaderboard,
    getLeaderboardSorted,
    exportData,
    importData,
    saveGameState,
    getGameState,
    clearGameState,
    getAdminPin,
    setAdminPin,
    saveLeaderboard
  };
})();
