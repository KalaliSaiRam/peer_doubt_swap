const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });

    let sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
    
    // Remove the database creation and selection lines so it uses the railway default DB
    sql = sql.replace(/CREATE DATABASE IF NOT EXISTS peer_doubt_swap;/g, '');
    sql = sql.replace(/USE peer_doubt_swap;/g, '');

    console.log('Applying schema to database: ' + process.env.DB_NAME + ' ...');
    await connection.query(sql);
    console.log('✅ Tables created successfully in ' + process.env.DB_NAME + '!');
    
    await connection.end();
    process.exit(0);
  } catch (e) {
    console.error('Failed to create tables:', e);
    process.exit(1);
  }
}
run();
