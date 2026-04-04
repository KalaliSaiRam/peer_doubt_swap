/**
 * migrate-roles.js — Adds the 'role' column to the 'users' table.
 */
const pool = require('./db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Adding role column...');
    
    // Check if column exists
    const [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "role"');
    if (columns.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT "user" AFTER branch');
      console.log('✅ Column "role" added successfully.');
    } else {
      console.log('ℹ️ Column "role" already exists.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
