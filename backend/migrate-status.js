/**
 * migrate-status.js — Adds the 'status' column to the 'users' table.
 * Run: node migrate-status.js
 */
const pool = require('./db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Adding status column...');

    const [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "status"');
    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER role
      `);
      console.log('✅ Column "status" added successfully.');
      console.log('ℹ️  All existing users default to "active".');
    } else {
      console.log('ℹ️  Column "status" already exists. Skipping.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
