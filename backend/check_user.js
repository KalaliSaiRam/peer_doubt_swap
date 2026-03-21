require('dotenv').config();
const pool = require('./db');
async function run() {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = "meghana110506"');
  console.log("DB Data:", rows[0]);
  process.exit(0);
}
run();
