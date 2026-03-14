/* ═══════════════════════════════════════════
   THINK TWICE — Leaderboard API
   Express + SQLite backend for cloud scores
   ═══════════════════════════════════════════ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8765', 'http://127.0.0.1:8765'];

// ─── Middleware ───

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Database ───

const dbPath = process.env.DB_PATH || path.join(__dirname, 'leaderboard.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '★',
    icon_color TEXT DEFAULT 'cyan',
    total_points INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    best_game INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    session_score INTEGER NOT NULL,
    game_mode TEXT DEFAULT 'classic',
    played_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
  );
`);

// Prepared statements
const stmts = {
  getPlayer: db.prepare('SELECT * FROM players WHERE id = ?'),
  upsertPlayer: db.prepare(`
    INSERT INTO players (id, name, icon, icon_color, total_points, games_played, best_game, updated_at)
    VALUES (@id, @name, @icon, @iconColor, @totalPoints, @gamesPlayed, @bestGame, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      icon = @icon,
      icon_color = @iconColor,
      total_points = @totalPoints,
      games_played = @gamesPlayed,
      best_game = @bestGame,
      updated_at = datetime('now')
  `),
  getLeaderboard: db.prepare(`
    SELECT id, name, icon, icon_color as iconColor, total_points as totalPoints,
           games_played as gamesPlayed, best_game as bestGame
    FROM players
    ORDER BY total_points DESC
    LIMIT 50
  `),
  recordGame: db.prepare(`
    INSERT INTO game_results (player_id, session_score, game_mode)
    VALUES (?, ?, ?)
  `),
  updatePlayerScore: db.prepare(`
    UPDATE players SET
      total_points = total_points + @score,
      games_played = games_played + 1,
      best_game = MAX(best_game, @score),
      updated_at = datetime('now')
    WHERE id = @id
  `),
  deletePlayer: db.prepare('DELETE FROM players WHERE id = ?'),
  deletePlayerGames: db.prepare('DELETE FROM game_results WHERE player_id = ?')
};

// ─── Input validation ───

function isValidId(id) {
  return typeof id === 'string' && /^[a-z0-9]{6,20}$/.test(id);
}

function isValidName(name) {
  return typeof name === 'string' && name.length >= 1 && name.length <= 20;
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0 && score <= 100000;
}

// ─── Routes ───

// GET /api/leaderboard — global top scores
app.get('/api/leaderboard', (req, res) => {
  const rows = stmts.getLeaderboard.all();
  res.json({ leaderboard: rows });
});

// POST /api/sync — sync a player's full record (used on app load)
app.post('/api/sync', (req, res) => {
  const { id, name, icon, iconColor, totalPoints, gamesPlayed, bestGame } = req.body;

  if (!isValidId(id) || !isValidName(name)) {
    return res.status(400).json({ error: 'Invalid player data' });
  }

  const existing = stmts.getPlayer.get(id);

  if (existing) {
    // Merge: take whichever has more total points (handles offline play)
    const mergedTotal = Math.max(existing.total_points, totalPoints || 0);
    const mergedGames = Math.max(existing.games_played, gamesPlayed || 0);
    const mergedBest = Math.max(existing.best_game, bestGame || 0);

    stmts.upsertPlayer.run({
      id,
      name: name || existing.name,
      icon: icon || existing.icon,
      iconColor: iconColor || existing.icon_color,
      totalPoints: mergedTotal,
      gamesPlayed: mergedGames,
      bestGame: mergedBest
    });

    return res.json({
      player: { id, name, icon, iconColor, totalPoints: mergedTotal, gamesPlayed: mergedGames, bestGame: mergedBest },
      merged: true
    });
  }

  // New player
  stmts.upsertPlayer.run({
    id,
    name,
    icon: icon || '★',
    iconColor: iconColor || 'cyan',
    totalPoints: totalPoints || 0,
    gamesPlayed: gamesPlayed || 0,
    bestGame: bestGame || 0
  });

  res.json({
    player: { id, name, icon, iconColor, totalPoints: totalPoints || 0, gamesPlayed: gamesPlayed || 0, bestGame: bestGame || 0 },
    merged: false
  });
});

// POST /api/score — record a game result
app.post('/api/score', (req, res) => {
  const { playerId, sessionScore, gameMode } = req.body;

  if (!isValidId(playerId) || !isValidScore(sessionScore)) {
    return res.status(400).json({ error: 'Invalid score data' });
  }

  const player = stmts.getPlayer.get(playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found. Sync player first.' });
  }

  stmts.recordGame.run(playerId, sessionScore, gameMode || 'classic');
  stmts.updatePlayerScore.run({ id: playerId, score: sessionScore });

  const updated = stmts.getPlayer.get(playerId);
  res.json({
    totalPoints: updated.total_points,
    gamesPlayed: updated.games_played,
    bestGame: updated.best_game
  });
});

// DELETE /api/player/:id — remove a player
app.delete('/api/player/:id', (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }

  stmts.deletePlayerGames.run(id);
  stmts.deletePlayer.run(id);
  res.json({ deleted: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', players: db.prepare('SELECT COUNT(*) as count FROM players').get().count });
});

// ─── Admin Routes ───

function requireAdmin(req, res, next) {
  if (!ADMIN_KEY) {
    return res.status(503).json({ error: 'Admin not configured' });
  }
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /api/admin/auth — verify admin key
app.post('/api/admin/auth', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// GET /api/admin/players — list all players
app.get('/api/admin/players', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, name, icon, icon_color as iconColor, total_points as totalPoints,
           games_played as gamesPlayed, best_game as bestGame
    FROM players ORDER BY name
  `).all();
  res.json({ players: rows });
});

// DELETE /api/admin/player/:id — admin delete (bypasses PIN)
app.delete('/api/admin/player/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }
  stmts.deletePlayerGames.run(id);
  stmts.deletePlayer.run(id);
  res.json({ deleted: true });
});

// ─── Start ───

app.listen(PORT, () => {
  console.log(`Think Twice API running on port ${PORT}`);
});
