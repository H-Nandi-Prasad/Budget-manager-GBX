import pool from '../utils/db';
import { initializeDatabase } from '../utils/initDb';

async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init(); 