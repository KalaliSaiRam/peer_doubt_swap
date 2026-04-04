/**
 * routes/authRoutes.js — Register, Login, Forgot Password, Reset Password
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// ── Helper: generate JWT ────────────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      first_name, last_name, username, email, password,
      dob, gender, is_student, college_name, passout_year, branch
    } = req.body;

    // Validation
    if (!first_name || !last_name || !username || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    if (!/^(?=.*[a-z])(?=.*\d)[a-z0-9_]{6,}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be ≥6 chars with at least one lowercase letter and number, and only contain lowercase letters, numbers or underscores.' });
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address with a proper domain.' });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      return res.status(400).json({ error: 'Password must have 8+ chars, uppercase, lowercase, number & special char.' });
    }

    // Check if username or email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already registered.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash, dob, gender, is_student, college_name, passout_year, branch)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, username, email, password_hash, dob || null, gender || null, is_student ? 1 : 0, college_name || null, passout_year || null, branch || null]
    );

    const token = generateToken({ id: result.insertId, username, role: 'user' });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: result.insertId, username, first_name, last_name, email,
              dob, gender, is_student, college_name, passout_year, branch,
              stars: 0, level: 'Bronze', role: 'user' }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!password || (!email && !username)) {
      return res.status(400).json({ error: 'Please provide password and email or username.' });
    }

    let rows = [];

    if (email && username) {
      // Use both identifiers when provided, but compare case-insensitively.
      [rows] = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND LOWER(username) = LOWER(?)',
        [email, username]
      );
    } else if (email) {
      [rows] = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
        [username]
      );
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found for the provided credentials.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Check account status
    if (user.status === 'suspended' || user.status === 'banned') {
      const msg = user.status === 'suspended' 
        ? 'Your account has been temporarily suspended by an administrator.' 
        : 'Your account has been permanently banned from Peer Doubt Swap.';
      return res.status(403).json({ error: msg });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        is_student: user.is_student,
        college_name: user.college_name,
        passout_year: user.passout_year,
        branch: user.branch,
        role: user.role,
        stars: user.stars,
        level: user.level
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide an email.' });
    }

    // Check if email exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    // In a real app, you'd send an email here. For now, just confirm email exists.
    res.json({ message: 'Email verified. You can now set a new password.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(new_password)) {
      return res.status(400).json({ error: 'Password must have 8+ chars, uppercase, lowercase, number & special char.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [password_hash, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    res.json({ message: 'Password updated successfully!' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
