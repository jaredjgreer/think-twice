/* ═══════════════════════════════════════════
   THINK TWICE — Cloud Sync Module
   Syncs leaderboard with remote API.
   Falls back to local-only if offline.
   ═══════════════════════════════════════════ */

const CloudSync = (() => {

  // Set this to your DigitalOcean API URL in production
  const API_URL = window.THINK_TWICE_API || '';

  let online = false;

  async function init() {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        online = true;
        await syncAllPlayers();
      }
    } catch (e) {
      online = false;
    }
  }

  function isOnline() {
    return online && !!API_URL;
  }

  // Sync all local players to cloud on startup
  async function syncAllPlayers() {
    if (!isOnline()) return;
    const lb = Storage.getLeaderboard();
    const players = Storage.getPlayers();

    for (const player of players) {
      const entry = lb[player.id];
      if (!entry) continue;
      try {
        const res = await fetch(`${API_URL}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: player.id,
            name: entry.name,
            icon: entry.icon || player.icon,
            iconColor: entry.iconColor || player.iconColor,
            totalPoints: entry.totalPoints || 0,
            gamesPlayed: entry.gamesPlayed || 0,
            bestGame: entry.bestGame || 0
          })
        });
        if (res.ok) {
          const data = await res.json();
          // Update local with merged cloud data
          if (data.merged && data.player) {
            lb[player.id].totalPoints = data.player.totalPoints;
            lb[player.id].gamesPlayed = data.player.gamesPlayed;
            lb[player.id].bestGame = data.player.bestGame;
          }
        }
      } catch (e) {
        // Silently fail — local data preserved
      }
    }
    Storage.saveLeaderboard(lb);
  }

  // Push a single game score to cloud
  async function pushScore(playerId, sessionScore, gameMode) {
    if (!isOnline()) return null;
    try {
      const res = await fetch(`${API_URL}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, sessionScore, gameMode })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Offline — local score already saved
    }
    return null;
  }

  // Fetch global leaderboard from cloud
  async function fetchLeaderboard() {
    if (!isOnline()) return null;
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return data.leaderboard;
      }
    } catch (e) {
      // Offline
    }
    return null;
  }

  // Sync a newly created player to cloud
  async function syncNewPlayer(player, lbEntry) {
    if (!isOnline()) return;
    try {
      await fetch(`${API_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: player.id,
          name: lbEntry.name,
          icon: lbEntry.icon || player.icon,
          iconColor: lbEntry.iconColor || player.iconColor,
          totalPoints: 0,
          gamesPlayed: 0,
          bestGame: 0
        })
      });
    } catch (e) {
      // Will sync on next app load
    }
  }

  // Remove player from cloud
  async function deletePlayer(playerId) {
    if (!isOnline()) return;
    try {
      await fetch(`${API_URL}/api/player/${encodeURIComponent(playerId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      // Non-critical
    }
  }

  return {
    init,
    isOnline,
    pushScore,
    fetchLeaderboard,
    syncNewPlayer,
    deletePlayer,
    syncAllPlayers
  };

})();
