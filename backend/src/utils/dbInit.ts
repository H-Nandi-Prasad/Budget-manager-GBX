import pool from './db';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2/promise';

interface Department extends RowDataPacket {
  id: number;
  name: string;
}

export async function initializeDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        budget INT NOT NULL,
        spent INT DEFAULT 0,
        description TEXT,
        manager VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_id INT NOT NULL,
        amount INT NOT NULL,
        description TEXT,
        category VARCHAR(255),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    // Create admin user if it doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, ['admin', 'admin@example.com', hashedPassword, 'admin']);

    // Create regular user if it doesn't exist
    const userHashedPassword = await bcrypt.hash('user123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, ['user', 'user@example.com', userHashedPassword, 'user']);

    // Create initial departments if they don't exist
    await connection.query(`
      INSERT IGNORE INTO departments (name, budget, description, manager)
      VALUES 
        ('Finance', 100000, 'Finance Department', 'John Doe'),
        ('HR', 50000, 'Human Resources', 'Jane Smith'),
        ('IT', 150000, 'Information Technology', 'Bob Johnson')
    `);

    // Create some sample transactions
    const [departments] = await connection.query<Department[]>('SELECT id, name FROM departments');
    for (const dept of departments) {
      await connection.query(`
        INSERT IGNORE INTO transactions (department_id, amount, description, category, date)
        VALUES (?, ?, ?, ?, ?)
      `, [dept.id, 5000, 'Initial expense', 'Expenses', new Date()]);
    }

    // Commit the transaction
    await connection.commit();
    console.log('Database initialized successfully');
  } catch (error) {
    // Rollback in case of error
    await connection.rollback();
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    connection.release();
  }
} 