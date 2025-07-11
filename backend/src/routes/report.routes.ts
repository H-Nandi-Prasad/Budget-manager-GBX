import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import pool from '../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface Report extends RowDataPacket {
  id: number;
  type: string;
  parameters: string; // JSON string
  data: string; // JSON string
  created_at: Date;
  updated_at: Date;
}

interface Transaction extends RowDataPacket {
  id: number;
  department_id: number;
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

interface Department extends RowDataPacket {
  id: number;
  name: string;
  budget: number;
  spent: number;
}

const router = express.Router();

// Helper function to ensure safe number calculations
function safeNumber(value: number | null | undefined): number {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Math.floor(value); // Ensure integer values
}

// Generate a report
router.post('/', authMiddleware, async (req, res) => {
  const { type, parameters } = req.body;

  try {
    let reportData;
    
    switch (type) {
      case 'department-spending':
        const { startDate, endDate } = parameters;
        
        // Get department spending data
        const [departments] = await pool.query<Department[]>(`
          SELECT 
            d.*,
            COALESCE((
              SELECT SUM(amount) 
              FROM transactions 
              WHERE department_id = d.id
                AND date BETWEEN ? AND ?
            ), 0) as spent
          FROM departments d
        `, [startDate, endDate]);

        const totalBudget = departments.reduce((sum, dept) => sum + safeNumber(dept.budget), 0);
        const totalSpent = departments.reduce((sum, dept) => sum + safeNumber(dept.spent), 0);

        reportData = {
          departments: departments.map(dept => ({
            ...dept,
            budget: safeNumber(dept.budget),
            spent: safeNumber(dept.spent)
          })),
          totalBudget,
          totalSpent,
          period: { startDate, endDate }
        };
        break;

      case 'transaction-history':
        const { departmentId, category } = parameters;
        
        // Build query conditions
        const conditions = [];
        const queryParams = [];
        
        if (departmentId) {
          conditions.push('department_id = ?');
          queryParams.push(departmentId);
        }
        if (category) {
          conditions.push('category = ?');
          queryParams.push(category);
        }

        const whereClause = conditions.length > 0 
          ? 'WHERE ' + conditions.join(' AND ')
          : '';

        // Get transactions
        const [transactions] = await pool.query<Transaction[]>(`
          SELECT t.*, d.name as department_name
          FROM transactions t
          JOIN departments d ON t.department_id = d.id
          ${whereClause}
          ORDER BY date DESC
        `, queryParams);

        const totalAmount = transactions.reduce((sum, tx) => sum + safeNumber(tx.amount), 0);

        reportData = {
          transactions: transactions.map(tx => ({
            ...tx,
            amount: safeNumber(tx.amount)
          })),
          totalAmount,
          filters: { departmentId, category }
        };
        break;

      default:
        return res.status(400).json({
          message: 'Invalid report type',
          status: 400
        });
    }

    // Save report
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO reports (type, parameters, data) VALUES (?, ?, ?)',
      [type, JSON.stringify(parameters), JSON.stringify(reportData)]
    );

    const [savedReport] = await pool.query<Report[]>(
      'SELECT * FROM reports WHERE id = ?',
      [result.insertId]
    );

    if (!savedReport[0]) {
      throw new Error('Failed to save report');
    }

    const parsedReport = {
      ...savedReport[0],
      parameters: JSON.parse(savedReport[0].parameters),
      data: JSON.parse(savedReport[0].data)
    };

    res.json({
      data: parsedReport,
      status: 200
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Server error',
      status: 500 
    });
  }
});

// Get all reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [reports] = await pool.query<Report[]>('SELECT * FROM reports ORDER BY created_at DESC');
    
    const parsedReports = reports.map(report => {
      try {
        return {
          ...report,
          parameters: JSON.parse(report.parameters),
          data: JSON.parse(report.data)
        };
      } catch (e) {
        console.error(`Error parsing report ${report.id}:`, e);
        return null;
      }
    }).filter(Boolean);

    res.json({
      data: parsedReports,
      status: 200
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific report
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [reports] = await pool.query<Report[]>(
      'SELECT * FROM reports WHERE id = ?',
      [req.params.id]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        message: 'Report not found',
        status: 404
      });
    }

    try {
      const parsedReport = {
        ...reports[0],
        parameters: JSON.parse(reports[0].parameters),
        data: JSON.parse(reports[0].data)
      };

      res.json({
        data: parsedReport,
        status: 200
      });
    } catch (e) {
      console.error(`Error parsing report ${reports[0].id}:`, e);
      res.status(500).json({ 
        message: 'Error parsing report data',
        status: 500 
      });
    }
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 