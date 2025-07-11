import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import pool from '../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface Transaction extends RowDataPacket {
  id: number;
  department_id: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
}

const router = express.Router();

// Helper function to ensure safe integer calculations
function safeNumber(value: any): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  // Convert string to number if needed
  let num = typeof value === 'string' ? value.replace(/,/g, '') : value;
  num = parseInt(num);

  // Check if it's a valid number
  if (isNaN(num)) {
    return null;
  }

  // Check if it's within safe integer range
  if (!Number.isSafeInteger(num)) {
    return null;
  }

  return num;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, department } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT t.*, d.name as department_name 
      FROM transactions t
      JOIN departments d ON t.department_id = d.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t';
    const queryParams: any[] = [];

    if (department) {
      query += ' WHERE d.id = ?';
      countQuery += ' JOIN departments d ON t.department_id = d.id WHERE d.id = ?';
      queryParams.push(department);
    }

    query += ' ORDER BY t.date DESC LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), offset);

    const [transactions] = await pool.query(query, queryParams);
    const [totalResult] = await pool.query<(RowDataPacket & { total: number })[]>(countQuery, department ? [department] : []);
    
    res.json({
      data: transactions,
      total: totalResult[0].total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { department_id, amount, description, category, date } = req.body;
    // Convert undefined to null for category
    const safeCategory = typeof category === 'undefined' ? null : category;
    // Validate amount
    const safeAmount = safeNumber(amount);
    if (safeAmount === null || safeAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive whole number' });
    }
    // Insert the transaction
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO transactions (department_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?)',
      [department_id, safeAmount, description, safeCategory, date]
    );

    // Get the created transaction
    const [transactions] = await pool.query<Transaction[]>(
      `SELECT t.*, d.name as department_name 
       FROM transactions t
       JOIN departments d ON t.department_id = d.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    // Ensure amount is an integer in response
    const response = {
      ...transactions[0],
      amount: safeNumber(transactions[0].amount)
    };

    res.status(201).json({
      data: response,
      status: 201
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, amount, description, category, date } = req.body;
    // Convert undefined to null for category
    const safeCategory = typeof category === 'undefined' ? null : category;
    // Validate amount
    const safeAmount = safeNumber(amount);
    if (safeAmount === null || safeAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive whole number' });
    }
    const [oldTransactions] = await pool.query<Transaction[]>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    if (oldTransactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // Update the transaction
    await pool.query(
      'UPDATE transactions SET department_id = ?, amount = ?, description = ?, category = ?, date = ? WHERE id = ?',
      [department_id, safeAmount, description, safeCategory, date, id]
    );

    // Get the updated transaction
    const [transactions] = await pool.query<Transaction[]>(
      `SELECT t.*, d.name as department_name 
       FROM transactions t
       JOIN departments d ON t.department_id = d.id
       WHERE t.id = ?`,
      [id]
    );

    // Ensure amount is an integer in response
    const response = {
      ...transactions[0],
      amount: safeNumber(transactions[0].amount)
    };

    res.json({
      data: response,
      status: 200
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const [transactions] = await pool.query<Transaction[]>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Delete the transaction
    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({
      data: null,
      status: 200
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 