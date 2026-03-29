/**
 * routes/profileRoutes.js — Get profile, doubts asked, doubts solved
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// ── GET /api/profile — Get logged-in user's full profile (requires auth) ────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, username, email, dob, gender, is_student, college_name, passout_year, branch, stars, level, profile_pic, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/profile/doubts-asked — Doubts posted by logged-in user ──────────
router.get('/doubts-asked', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id AS doubt_id, d.question, d.subject AS subject_name, d.difficulty, d.created_at,
        (SELECT COUNT(*) FROM comments c WHERE c.doubt_id = d.id) AS answer_count
       FROM doubts d
       WHERE d.user_id = ?
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get doubts asked error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/profile/doubts-solved — Doubts where user posted a comment ──────
router.get('/doubts-solved', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id AS doubt_id, d.question, d.subject AS subject_name, d.difficulty, d.created_at,
        (SELECT COUNT(*) FROM comments c2 WHERE c2.doubt_id = d.id) AS answer_count,
        (SELECT c3.id FROM comments c3
         WHERE c3.doubt_id = d.id AND c3.user_id = ?
         ORDER BY c3.created_at DESC LIMIT 1) AS my_comment_id
       FROM doubts d
       WHERE EXISTS (
         SELECT 1 FROM comments c WHERE c.doubt_id = d.id AND c.user_id = ?
       )
       ORDER BY d.created_at DESC`,
      [req.user.id, req.user.id]
    );

    res.json(rows);

  } catch (err) {
    console.error('Get doubts solved error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── PUT /api/profile/avatar — Save selected avatar index ────────────────────
router.put('/avatar', auth, async (req, res) => {
  const { profile_pic } = req.body;
  if (profile_pic === undefined || profile_pic === null) {
    return res.status(400).json({ error: 'profile_pic is required.' });
  }
  try {
    await pool.query('UPDATE users SET profile_pic = ? WHERE id = ?', [String(profile_pic), req.user.id]);
    res.json({ success: true, profile_pic: String(profile_pic) });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
