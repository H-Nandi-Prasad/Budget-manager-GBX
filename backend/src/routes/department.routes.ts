import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import pool from '../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface Department extends RowDataPacket {
  id: number;
  name: string;
  budget: number;
  spent: number;
  description: string | null;
  manager: string | null;
  created_at: Date;
  updated_at: Date;
}

const router = express.Router();

const validateNumber = (value: any): number | null => {
  if (value === undefined || value === null) return null;
  
  try {
    // Convert strings to numbers and handle various numeric formats
    const cleanValue = typeof value === 'string' 
      ? value.replace(/[^\d-]/g, '') // Remove any non-numeric chars except minus
      : String(value);
    
    const num = parseInt(cleanValue, 10);
    
    // Validate the number
    if (isNaN(num) || !isFinite(num)) {
      console.warn('Invalid number format:', value);
      return null;
    }
    
    // Check range
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn('Number out of safe range:', num);
      return null;
    }
    
    return num;
  } catch (error) {
    console.error('Error validating number:', error);
    return null;
  }
};

// Get all departments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query<Department[]>(`
      SELECT 
        d.*,
        COALESCE(
          (SELECT SUM(amount) 
           FROM transactions 
           WHERE department_id = d.id),
          0
        ) as spent
      FROM departments d 
      ORDER BY name
    `);

    res.json({
      data: rows,
      status: 200
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a department
router.post('/', authMiddleware, async (req, res) => {
  const { name, budget, description, manager } = req.body;
  
  // Validate input
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ 
      message: 'Department name is required and must be a string',
      status: 400 
    });
  }

  const budgetNumber = validateNumber(budget);
  if (budgetNumber === null || budgetNumber <= 0) {
    return res.status(400).json({ 
      message: 'Budget must be a valid positive whole number',
      status: 400 
    });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO departments (name, budget, description, manager) VALUES (?, ?, ?, ?)',
      [name.toUpperCase(), budgetNumber, description, manager]
    );
    
    const [rows] = await pool.query<Department[]>(`
      SELECT 
        d.*,
        COALESCE(
          (SELECT SUM(amount) 
           FROM transactions 
           WHERE department_id = d.id),
          0
        ) as spent
      FROM departments d 
      WHERE d.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      data: rows[0],
      status: 201
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a department
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, budget, description, manager } = req.body;

  // Validate input
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ 
      message: 'Department name is required and must be a string',
      status: 400 
    });
  }

  const budgetNumber = validateNumber(budget);
  if (budgetNumber === null || budgetNumber <= 0) {
    return res.status(400).json({ 
      message: 'Budget must be a positive number',
      status: 400 
    });
  }

  try {
    // Check if department exists
    const [existing] = await pool.query<Department[]>('SELECT * FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ 
        message: 'Department not found',
        status: 404 
      });
    }

    await pool.query<ResultSetHeader>(
      'UPDATE departments SET name = ?, budget = ?, description = ?, manager = ? WHERE id = ?',
      [name.toUpperCase(), budgetNumber, description, manager, id]
    );
    
    const [rows] = await pool.query<Department[]>(`
      SELECT 
        d.*,
        COALESCE(
          (SELECT SUM(amount) 
           FROM transactions 
           WHERE department_id = d.id AND amount < 0),
          0
        ) as spent
      FROM departments d 
      WHERE d.id = ?
    `, [id]);
    
    res.json({
      data: rows[0],
      status: 200
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a department
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<Department[]>('SELECT * FROM departments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Department not found',
        status: 404 
      });
    }

    // First delete all transactions associated with this department
    await pool.query('DELETE FROM transactions WHERE department_id = ?', [id]);
    // Then delete the department
    await pool.query<ResultSetHeader>('DELETE FROM departments WHERE id = ?', [id]);
    
    res.json({
      data: null,
      status: 200
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 