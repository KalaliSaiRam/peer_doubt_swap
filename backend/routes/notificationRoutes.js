/**
 * routes/notificationRoutes.js — Alerts when someone comments on your doubt
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ── GET /api/notifications — Unread count + recent items (requires auth) ─────
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS unreadCount
       FROM comments c
       INNER JOIN doubts d ON c.doubt_id = d.id
       INNER JOIN users owner ON owner.id = d.user_id
       WHERE d.user_id = ?
         AND c.user_id != ?
         AND c.created_at > COALESCE(owner.notifications_last_read_at, owner.created_at)`,
      [userId, userId]
    );

    const unreadCount = countRows[0]?.unreadCount ?? 0;

    const [items] = await pool.query(
      `SELECT
         c.id AS comment_id,
         c.doubt_id,
         c.created_at,
         LEFT(d.question, 100) AS question_preview,
         u.username AS from_username
       FROM comments c
       INNER JOIN doubts d ON c.doubt_id = d.id
       INNER JOIN users u ON c.user_id = u.id
       INNER JOIN users owner ON owner.id = d.user_id
       WHERE d.user_id = ?
         AND c.user_id != ?
         AND c.created_at > COALESCE(owner.notifications_last_read_at, owner.created_at)
       ORDER BY c.created_at DESC
       LIMIT 15`,
      [userId, userId]
    );

    res.json({ unreadCount, items });
  } catch (err) {
    console.error('Notifications GET error:', err);
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      return res.status(503).json({
        error: 'Notifications require DB migration: add users.notifications_last_read_at',
        unreadCount: 0,
        items: []
      });
    }
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/notifications/mark-read — Clear unread badge (requires auth) ────
router.post('/mark-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(
      'UPDATE users SET notifications_last_read_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Notifications mark-read error:', err);
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      return res.status(503).json({
        error: 'Notifications require DB migration: add users.notifications_last_read_at'
      });
    }
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
