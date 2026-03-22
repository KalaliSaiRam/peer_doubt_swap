/**
 * routes/leaderboardRoutes.js — Public leaderboard
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/leaderboard — top 50 users by stars
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         username,
         stars,
         level,
         (SELECT COUNT(*) FROM doubts d WHERE d.user_id = u.id) AS doubts_asked,
         (SELECT COUNT(DISTINCT c.doubt_id) FROM comments c WHERE c.user_id = u.id) AS doubts_solved
       FROM users u
       ORDER BY stars DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
