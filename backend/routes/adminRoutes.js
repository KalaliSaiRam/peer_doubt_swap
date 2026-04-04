/**
 * routes/adminRoutes.js — Administrative API Endpoints
 * All routes are protected by authMiddleware and adminMiddleware.
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply protection to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[{ user_count }]] = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const [[{ doubt_count }]] = await pool.query('SELECT COUNT(*) as doubt_count FROM doubts');
    const [[{ comment_count }]] = await pool.query('SELECT COUNT(*) as comment_count FROM comments');

    res.json({
      users: user_count,
      doubts: doubt_count,
      comments: comment_count
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch platform stats.' });
  }
});

// ── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, first_name, last_name, username, email, role, status, stars, level, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// ── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId == req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User account deleted successfully.' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// ── PUT /api/admin/users/:id/status ──────────────────────────────────────────
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    if (userId == req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own admin status.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ message: `User status updated to ${status}.` });
  } catch (err) {
    console.error('Admin update status error:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// ── GET /api/admin/doubts ────────────────────────────────────────────────────
router.get('/doubts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, u.username as asker_username 
      FROM doubts d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Admin doubts error:', err);
    res.status(500).json({ error: 'Failed to fetch doubts list.' });
  }
});

// ── DELETE /api/admin/doubts/:id ─────────────────────────────────────────────
router.delete('/doubts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM doubts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Doubt deleted successfully.' });
  } catch (err) {
    console.error('Admin delete doubt error:', err);
    res.status(500).json({ error: 'Failed to delete doubt.' });
  }
});

module.exports = router;
