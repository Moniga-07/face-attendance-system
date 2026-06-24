require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDb() {
  try {
    // Connect without database first to ensure it can create the DB if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Required to run multiple queries from the schema file
    });

    console.log('Connected to MySQL server.');

    const schemaPath = path.join(__dirname, '../../database/update_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(schemaSql);
    console.log('Database aligned and schema successfully applied!');

    await connection.end();
  } catch (error) {
    console.error('Error aligning database:', error);
    process.exit(1);
  }
}

initializeDb();
