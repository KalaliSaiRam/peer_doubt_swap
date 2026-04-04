/**
 * middleware/admin.js — Admin-only access middleware
 * Assumes authMiddleware has already run and attached req.user
 */
const pool = require('../db');

async function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  // Extra Security: Cross-check with DB for sensitive actions
  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Account no longer has admin privileges.' });
    }
    next();
  } catch (err) {
    console.error('Admin middleware check failed:', err);
    res.status(500).json({ error: 'Internal server error during verification.' });
  }
}

module.exports = adminMiddleware;
