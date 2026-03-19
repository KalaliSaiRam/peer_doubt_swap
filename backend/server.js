/**
 * server.js — Main Express server for Peer Doubt Swap
 * Mounts all API routes and serves the frontend static files.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve frontend static files ──────────────────────────────────────────────
// This lets you access the app at http://localhost:3000/html/index.html
const projectRoot = path.join(__dirname, '..');
app.use('/html', express.static(path.join(projectRoot, 'html')));
app.use('/css', express.static(path.join(projectRoot, 'css')));
app.use('/js', express.static(path.join(projectRoot, 'js')));
app.use('/images', express.static(path.join(projectRoot, 'images')));

// ── API Routes ───────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const doubtRoutes = require('./routes/doubtRoutes');
const commentRoutes = require('./routes/commentRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/doubts', commentRoutes);       // comments are nested under /api/doubts/:id/comments
app.use('/api/profile', profileRoutes);

// ── Root redirect ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Peer Doubt Swap API is running!' });
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Peer Doubt Swap server running at http://localhost:${PORT}`);
  console.log(`📄 Open app: http://localhost:${PORT}/html/index.html`);
  console.log(`📡 API base: http://localhost:${PORT}/api\n`);
});
