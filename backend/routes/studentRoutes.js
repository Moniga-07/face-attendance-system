const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/students
// @desc    Get all students
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, roll_no, name, department, year, created_at FROM students ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/students/all-descriptors
// @desc    Get all students with face descriptors for frontend matching (unprotected for live attendance)
router.get('/all-descriptors', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, roll_no, face_descriptor FROM students');
        // Parse JSON descriptors
        const students = rows.map(row => ({
            ...row,
            face_descriptor: typeof row.face_descriptor === 'string' ? JSON.parse(row.face_descriptor) : row.face_descriptor
        }));
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/students
// @desc    Register a new student
router.post('/', protect, async (req, res) => {
    const { roll_no, name, department, year, face_descriptor } = req.body;

    try {
        // Ensure face_descriptor is stored as JSON string
        const descriptorString = JSON.stringify(face_descriptor);
        
        const [result] = await pool.query(
            'INSERT INTO students (roll_no, name, department, year, face_descriptor) VALUES (?, ?, ?, ?, ?)',
            [roll_no, name, department, year, descriptorString]
        );

        res.status(201).json({ message: 'Student registered successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Roll number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student details
router.put('/:id', protect, async (req, res) => {
    const { roll_no, name, department, year } = req.body;
    try {
        await pool.query(
            'UPDATE students SET roll_no = ?, name = ?, department = ?, year = ? WHERE id = ?',
            [roll_no, name, department, year, req.params.id]
        );
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student (and cascading face data/attendance)
router.delete('/:id', protect, async (req, res) => {
    try {
        await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
