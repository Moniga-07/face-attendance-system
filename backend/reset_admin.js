const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({path: './backend/.env'});

async function run() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const hash = await bcrypt.hash('admin123', 10);
        await pool.query('DELETE FROM admins WHERE username="admin"');
        await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hash]);

        console.log('Admin account successfully reset to username: admin / password: admin123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
