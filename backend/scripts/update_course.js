const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateCourse() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'face_attendance_db'
    });

    try {
        const [result] = await connection.execute(
            `UPDATE students SET course = 'ITA0218 - Web technology' WHERE course IS NULL OR course = '' OR course = '-'`
        );
        console.log('Updated rows:', result.affectedRows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

updateCourse();
