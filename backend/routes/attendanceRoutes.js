const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/attendance
// @desc    Mark attendance (unprotected to allow kiosk mode)
router.post('/', async (req, res) => {
    const { student_id, attendance_date, attendance_time } = req.body;

    try {
        await pool.query(
            'INSERT INTO attendance (student_id, attendance_date, attendance_time, status) VALUES (?, ?, ?, ?)',
            [student_id, attendance_date, attendance_time, 'Present']
        );
        
        // Fetch student name for the response
        const [studentRows] = await pool.query('SELECT name FROM students WHERE id = ?', [student_id]);
        const studentName = studentRows.length > 0 ? studentRows[0].name : 'Unknown';

        res.status(201).json({ message: 'Attendance marked successfully', name: studentName });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/attendance
// @desc    Get attendance records (with filters)
router.get('/', protect, async (req, res) => {
    const { date, startDate, endDate } = req.query;
    
    try {
        let query = `
            SELECT a.id, a.attendance_date, a.attendance_time, a.status, s.roll_no, s.name, s.department, s.year 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id
        `;
        const params = [];

        if (date) {
            query += ' WHERE a.attendance_date = ?';
            params.push(date);
        } else if (startDate && endDate) {
            query += ' WHERE a.attendance_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY a.attendance_date DESC, a.attendance_time DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
