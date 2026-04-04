/**
 * migrate-admin-fields.js — Ensures 'role' and 'status' columns exist.
 */
const pool = require('./db');

async function migrate() {
  try {
    console.log('🔄 Checking users table for admin fields...');
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('role')) {
      console.log('➕ Adding "role" column...');
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER branch");
    }

    if (!columnNames.includes('status')) {
      console.log('➕ Adding "status" column...');
      await pool.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER role");
    }

    console.log('✅ Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
