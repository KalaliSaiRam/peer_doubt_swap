/**
 * routes/commentRoutes.js — Post comments/solutions, Get comments for a doubt
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ── POST /api/doubts/:doubtId/comments — Post a comment (requires auth) ─────
router.post('/:doubtId/comments', auth, async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

    // Check doubt exists
    const [doubt] = await pool.query('SELECT id, user_id FROM doubts WHERE id = ?', [doubtId]);
    if (doubt.length === 0) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Insert comment
    const [result] = await pool.query(
      'INSERT INTO comments (doubt_id, user_id, content) VALUES (?, ?, ?)',
      [doubtId, userId, content.trim()]
    );

    // Award stars to the solver (the person commenting)
    // +10 stars for each answer posted
    await pool.query('UPDATE users SET stars = stars + 10 WHERE id = ?', [userId]);

    // Recalculate level
    const [userRow] = await pool.query('SELECT stars FROM users WHERE id = ?', [userId]);
    if (userRow.length > 0) {
      const stars = userRow[0].stars;
      let level = 'Bronze';
      if (stars >= 1000) level = 'Diamond';
      else if (stars >= 600) level = 'Platinum';
      else if (stars >= 300) level = 'Gold';
      else if (stars >= 100) level = 'Silver';
      await pool.query('UPDATE users SET level = ? WHERE id = ?', [level, userId]);
    }

    res.status(201).json({
      message: 'Comment posted! +10 ⭐',
      comment: {
        id: result.insertId,
        doubt_id: parseInt(doubtId),
        user_id: userId,
        username: req.user.username,
        content: content.trim(),
        created_at: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/doubts/:doubtId/comments — Get all comments for a doubt ────────
router.get('/:doubtId/comments', async (req, res) => {
  try {
    const { doubtId } = req.params;

    const [rows] = await pool.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.doubt_id = ?
       ORDER BY c.created_at ASC`,
      [doubtId]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
