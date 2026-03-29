/**
 * migrate-avatar.js — Add profile_pic column to users table
 * Run: node backend/migrate-avatar.js
 */
require('dotenv').config({ path: __dirname + '/.env' });
const pool = require('./db');

(async () => {
  try {
    await pool.query(
      'ALTER TABLE users ADD COLUMN profile_pic VARCHAR(10) DEFAULT NULL'
    );
    console.log('profile_pic column added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('profile_pic column already exists, nothing to do.');
    } else {
      console.error('Migration error:', err.message);
    }
  }
  process.exit(0);
})();
