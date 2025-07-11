import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Log database configuration (without sensitive data)
console.log('Database Configuration:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'globalbudgetx',
  hasPassword: true
});

const pool: Pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Harsh@123',
  database: 'globalbudgetx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database Connection Error:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    // Don't exit process, let the application handle the error
  }); 