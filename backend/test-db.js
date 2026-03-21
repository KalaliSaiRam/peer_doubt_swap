const pool = require('./db.js');

async function testConnection() {
  try {
    const [rows, fields] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Database connection successful. Solution: ', rows[0].solution);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
