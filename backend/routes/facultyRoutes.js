const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/faculties
// @desc    Register a new faculty (Admin only, but for now we'll just protect it)
router.post('/', protect, async (req, res) => {
    const { username, password, name, department } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM faculties WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Faculty already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO faculties (username, password, name, department) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, name, department]
        );

        res.status(201).json({ message: 'Faculty registered successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/faculties
// @desc    Get all faculties
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, name, department FROM faculties');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
