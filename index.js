const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key'; // Use a strong secret in production!

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Harsh@123',
  database: 'globalbudgetx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database connection pool
let pool;
async function initializePool() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Exit if we can't connect to the database
  }
}

// Helper function to handle database queries
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

// Input validation middleware
function validateDepartment(req, res, next) {
  const { name, budget } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      status: 400,
      error: 'Department name is required and must be a non-empty string'
    });
  }
  
  if (budget !== undefined) {
    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      return res.status(400).json({
        status: 400,
        error: 'Budget must be a non-negative number'
      });
    }
  }
  
  next();
}

function validateTransaction(req, res, next) {
  const { department_id, amount } = req.body;
  
  if (!department_id || !Number.isInteger(Number(department_id))) {
    return res.status(400).json({
      status: 400,
      error: 'Valid department ID is required'
    });
  }
  
  if (amount === undefined || isNaN(Number(amount))) {
    return res.status(400).json({
      status: 400,
      error: 'Valid amount is required'
    });
  }
  
  next();
}

// Department routes
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await query(`
      SELECT d.*, 
        COALESCE(SUM(ABS(t.amount)), 0) as spent
      FROM departments d
      LEFT JOIN transactions t ON d.id = t.department_id
      GROUP BY d.id
    `);
    
    res.json({
      status: 200,
      data: departments.map(dept => ({
        ...dept,
        budget: parseFloat(dept.budget) || 0,
        spent: parseFloat(dept.spent) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to fetch departments'
    });
  }
});

app.post('/api/departments', validateDepartment, async (req, res) => {
  try {
    const { name, budget, description, manager } = req.body;
    const result = await query(
      'INSERT INTO departments (name, budget, description, manager) VALUES (?, ?, ?, ?)',
      [name.trim(), Number(budget), description !== undefined && description !== null ? description.trim() : null, manager !== undefined && manager !== null ? manager.trim() : null]
    );
    const newDept = await query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    res.status(201).json({
      status: 201,
      data: {
        ...newDept[0],
        budget: parseFloat(newDept[0].budget) || 0,
        spent: 0
      }
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create department'
    });
  }
});

app.put('/api/departments/:id', validateDepartment, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, description, manager } = req.body;
    
    // Check if department exists
    const existingDept = await query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!existingDept.length) {
      return res.status(404).json({
        status: 404,
        error: 'Department not found'
      });
    }
    
    const updates = [];
    const values = [];
    
    if (name) {
      updates.push('name = ?');
      values.push(name.trim().toUpperCase());
    }
    if (budget !== undefined) {
      updates.push('budget = ?');
      values.push(Number(budget));
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description !== undefined && description !== null ? description.trim() : null);
    }
    if (manager !== undefined) {
      updates.push('manager = ?');
      values.push(manager !== undefined && manager !== null ? manager.trim() : null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        status: 400,
        error: 'No updates provided'
      });
    }
    
    values.push(id);
    await query(
      `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const updatedDept = await query('SELECT * FROM departments WHERE id = ?', [id]);
    const spent = await query(
      'SELECT COALESCE(SUM(amount), 0) as spent FROM transactions WHERE department_id = ?',
      [id]
    );
    
    res.json({
      status: 200,
      data: {
        ...updatedDept[0],
        budget: parseFloat(updatedDept[0].budget) || 0,
        spent: parseFloat(spent[0].spent) || 0
      }
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to update department'
    });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if department exists
    const existingDept = await query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!existingDept.length) {
      return res.status(404).json({
        status: 404,
        error: 'Department not found'
      });
    }
    // Delete all transactions for this department
    await query('DELETE FROM transactions WHERE department_id = ?', [id]);
    // Delete the department
    await query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({
      status: 200,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to delete department'
    });
  }
});

// Transaction routes
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await query(`
      SELECT t.*, d.name as department_name
      FROM transactions t
      JOIN departments d ON t.department_id = d.id
      ORDER BY t.date DESC
    `);
    
    res.json({
      status: 200,
      data: transactions.map(trans => ({
        ...trans,
        amount: parseFloat(trans.amount) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to fetch transactions'
    });
  }
});

app.post('/api/transactions', validateTransaction, async (req, res) => {
  try {
    const { department_id, amount, description, category, date } = req.body;
    
    // Check if department exists
    const department = await query('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (!department.length) {
      return res.status(404).json({
        status: 404,
        error: 'Department not found'
      });
    }
    
    const result = await query(
      'INSERT INTO transactions (department_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?)',
      [
        Number(department_id),
        Number(amount),
        description !== undefined && description !== null ? description.trim() : null,
        category !== undefined && category !== null ? category.trim() : null,
        date ? new Date(date) : new Date()
      ]
    );
    
    // Update department budget or spent based on transaction type
    if (Number(amount) > 0) {
      // Income: increase department budget
      await query(
        'UPDATE departments SET budget = budget + ? WHERE id = ?',
        [Math.abs(Number(amount)), Number(department_id)]
      );
    } else {
      // Expense: increase spent
      await query(
        'UPDATE departments SET spent = COALESCE(spent, 0) + ? WHERE id = ?',
        [Math.abs(Number(amount)), Number(department_id)]
      );
    }
    
    const newTrans = await query(`
      SELECT t.*, d.name as department_name
      FROM transactions t
      JOIN departments d ON t.department_id = d.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      status: 201,
      data: {
        ...newTrans[0],
        amount: parseFloat(newTrans[0].amount) || 0
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create transaction'
    });
  }
});

// Initialize database tables
async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        budget DECIMAL(10,2) NOT NULL,
        description TEXT,
        manager VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        department_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializePool();
    await initDatabase();

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];

    // Compare password with hash
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Never return the password hash!
    delete user.password_hash;

    res.json({
      data: {
        token: token,
        user: user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await query('SELECT id, email FROM users WHERE id = ?', [decoded.id]);
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: users[0] });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/reports', (req, res) => {
  res.json({ data: [] });
});

startServer();

bcrypt.hash('Harsh123', 10, (err, hash) => {
  console.log(hash);
});

// Debug: Check if the password 'Harsh123' matches the given bcrypt hash
bcrypt.compare('Harsh123', '$2b$10$MT9EaiR4Mm38m/Zm0jzlQ..uVpSqyIrxGx7VfI/pReANkECnXCa3e', (err, res) => {
  console.log('Password matches hash:', res); // should print true if it matches
});
