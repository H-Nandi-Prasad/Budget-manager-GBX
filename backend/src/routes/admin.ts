import express from 'express';
import { initializeDatabase } from '../utils/dbInit';

const router = express.Router();

router.post('/init-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: (error as Error).message });
  }
});

export default router; 