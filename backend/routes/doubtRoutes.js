/**
 * routes/doubtRoutes.js — Post doubt, Get doubts, Filter doubts
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ── POST /api/doubts — Post a new doubt (requires auth) ─────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { subject, difficulty, question } = req.body;
    const userId = req.user.id;

    // Validation
    if (!subject || !difficulty || !question) {
      return res.status(400).json({ error: 'Subject, difficulty, and question are required.' });
    }

    const trimmed = question.trim();
    if (trimmed.length < 10) {
      return res.status(400).json({ error: 'Question must be at least 10 characters.' });
    }
    if (trimmed.length > 1000) {
      return res.status(400).json({ error: 'Question is too long (max 1000 chars).' });
    }

    const [result] = await pool.query(
      'INSERT INTO doubts (user_id, subject, difficulty, question) VALUES (?, ?, ?, ?)',
      [userId, subject, difficulty, trimmed]
    );

    // Award stars for engagement (+5 stars for asking)
    await pool.query('UPDATE users SET stars = stars + 5 WHERE id = ?', [userId]);

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
      message: 'Doubt posted successfully!',
      doubt: { id: result.insertId, subject, difficulty, question: trimmed }
    });

  } catch (err) {
    console.error('Post doubt error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/doubts — List all doubts (with optional filters) ────────────────
router.get('/', async (req, res) => {
  try {
    const { subject, difficulty } = req.query;

    let sql = `
      SELECT d.*, u.username,
        (SELECT COUNT(*) FROM comments c WHERE c.doubt_id = d.id) AS answer_count
      FROM doubts d
      JOIN users u ON d.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (subject && subject !== 'all') {
      conditions.push('d.subject = ?');
      params.push(subject);
    }
    if (difficulty && difficulty !== 'all') {
      conditions.push('d.difficulty = ?');
      params.push(difficulty);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error('Get doubts error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/doubts/:id — Get a single doubt ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, u.username
       FROM doubts d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get doubt error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
