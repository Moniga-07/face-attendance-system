require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function runMigrations() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'face_attendance_db',
            multipleStatements: true
        });

        console.log('Connected to MySQL server for migrations.');

        const queries = [
            // 1. Admins table updates
            `ALTER TABLE admins 
             ADD COLUMN faculty_name VARCHAR(255) NULL,
             ADD COLUMN faculty_id VARCHAR(100) NULL,
             ADD COLUMN course_name VARCHAR(255) NULL,
             ADD COLUMN course_code VARCHAR(100) NULL,
             ADD COLUMN period_slot VARCHAR(100) NULL,
             ADD COLUMN room_number VARCHAR(100) NULL;`,

            // 2. Students table updates
            `ALTER TABLE students
             ADD COLUMN course VARCHAR(255) NULL;`,

            // 3. Attendance table updates
            `ALTER TABLE attendance
             ADD COLUMN verification_method VARCHAR(50) DEFAULT 'Face Match';`
        ];

        for (let i = 0; i < queries.length; i++) {
            console.log(`Running migration step ${i + 1}...`);
            try {
                await connection.query(queries[i]);
                console.log(`Step ${i + 1} completed.`);
            } catch (err) {
                // Ignore "Duplicate column name" errors
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Step ${i + 1}: Columns already exist, skipping.`);
                } else {
                    throw err;
                }
            }
        }

        console.log('All migrations applied successfully!');
        await connection.end();
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

runMigrations();
