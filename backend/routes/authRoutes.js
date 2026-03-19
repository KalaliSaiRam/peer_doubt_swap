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
    { id: user.id, username: user.username },
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

    if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z0-9_]{6,}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be ≥6 chars with at least one letter and number.' });
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

    const token = generateToken({ id: result.insertId, username });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: result.insertId, username, first_name, last_name, email, stars: 0, level: 'Bronze' }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    // Find user by email AND username
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND username = ?',
      [email, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or username.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
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
