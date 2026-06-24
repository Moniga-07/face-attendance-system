const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/subjects
// @desc    Create a new subject
router.post('/', protect, async (req, res) => {
    const { subject_code, name, department, year } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM subjects WHERE subject_code = ?', [subject_code]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const [result] = await pool.query(
            'INSERT INTO subjects (subject_code, name, department, year) VALUES (?, ?, ?, ?)',
            [subject_code, name, department, year]
        );

        res.status(201).json({ message: 'Subject created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/subjects
// @desc    Get all subjects
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subjects');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subjects/assign
// @desc    Assign a subject to a faculty
router.post('/assign', protect, async (req, res) => {
    const { faculty_id, subject_id } = req.body;

    try {
        await pool.query(
            'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)',
            [faculty_id, subject_id]
        );
        res.status(200).json({ message: 'Subject assigned successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Subject already assigned to this faculty' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/subjects/my-subjects
// @desc    Get subjects for the logged-in faculty
router.get('/my-subjects', protect, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            // Admins can see all subjects
            const [rows] = await pool.query('SELECT * FROM subjects');
            return res.json(rows);
        }

        const [rows] = await pool.query(`
            SELECT s.* 
            FROM subjects s
            JOIN faculty_subjects fs ON s.id = fs.subject_id
            WHERE fs.faculty_id = ?
        `, [req.user.id]);
        
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
