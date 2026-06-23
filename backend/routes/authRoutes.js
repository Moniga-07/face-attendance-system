const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// @route   POST /api/auth/login
// @desc    Auth admin & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });

            res.json({
                id: admin.id,
                username: admin.username,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/setup', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM admins');
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Admin already setup' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
        res.json({ message: 'Admin account created successfully' });
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
