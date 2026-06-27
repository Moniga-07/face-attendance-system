const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'face_attendance_db'
    });

    try {
        // Add columns if they don't exist
        try {
            await connection.execute(`ALTER TABLE attendance ADD COLUMN course_code VARCHAR(255)`);
            console.log('Added course_code');
        } catch (e) {
            console.log('course_code already exists or error:', e.message);
        }
        
        try {
            await connection.execute(`ALTER TABLE attendance ADD COLUMN period_slot VARCHAR(255)`);
            console.log('Added period_slot');
        } catch (e) {
            console.log('period_slot already exists or error:', e.message);
        }

        // Drop the old unique constraint (likely on student_id, subject_id, attendance_date)
        try {
            // Find unique indexes
            const [indexes] = await connection.execute(`SHOW INDEXES FROM attendance WHERE Non_unique = 0 AND Key_name != 'PRIMARY'`);
            for (let idx of indexes) {
                try {
                    await connection.execute(`ALTER TABLE attendance DROP INDEX ${idx.Key_name}`);
                    console.log(`Dropped index ${idx.Key_name}`);
                } catch (e) {}
            }
        } catch (e) {
            console.log('Error dropping old indexes:', e.message);
        }

        // Add new unique constraint
        try {
            await connection.execute(`ALTER TABLE attendance ADD UNIQUE INDEX unique_attendance_slot (student_id, attendance_date, period_slot)`);
            console.log('Added unique_attendance_slot');
        } catch (e) {
            console.log('unique_attendance_slot already exists or error:', e.message);
        }
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await connection.end();
    }
}

alterTable();
