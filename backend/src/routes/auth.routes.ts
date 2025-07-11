import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface User extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  role: string;
}

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        status: 400 
      });
    }

    // Get user by email
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        status: 401 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid password',
        status: 401 
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role
        }
      },
      status: 200
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login. Please try again.',
      status: 500 
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if email exists
    const [existingUsers] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, password_hash, username, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'user']
    );

    const [newUser] = await pool.query<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = jwt.sign(
      { userId: newUser[0].id, role: newUser[0].role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      data: {
        token,
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].username,
          role: newUser[0].role
        }
      },
      status: 201
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.username,
        role: user.role
      },
      status: 200
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 