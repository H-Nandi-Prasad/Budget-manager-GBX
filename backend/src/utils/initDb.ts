import fs from 'fs';
import path from 'path';
import pool from './db';

async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split the schema into individual statements
        const statements = schema
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        console.log('Initializing database...');

        // Execute each statement
        for (const statement of statements) {
            if (statement.includes('DELIMITER')) continue; // Skip DELIMITER statements as they're for MySQL CLI
            await pool.query(statement);
        }

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Execute if this file is run directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { initializeDatabase }; 