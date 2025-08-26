require('dotenv').config();
const mysql = require('mysql2');

// Create a connection pool to the database
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  }
});

module.exports = db;