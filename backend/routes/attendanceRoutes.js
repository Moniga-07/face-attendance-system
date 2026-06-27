const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/attendance
// @desc    Mark attendance (unprotected to allow kiosk mode)
router.post('/', async (req, res) => {
    const { student_id, subject_id, course_code, period_slot, attendance_date, attendance_time } = req.body;

    try {
        await pool.query(
            'INSERT INTO attendance (student_id, subject_id, course_code, period_slot, attendance_date, attendance_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [student_id, subject_id || null, course_code || null, period_slot || null, attendance_date, attendance_time, 'Present']
        );
        
        // Fetch student name for the response
        const [studentRows] = await pool.query('SELECT name FROM students WHERE id = ?', [student_id]);
        const studentName = studentRows.length > 0 ? studentRows[0].name : 'Unknown';

        res.status(201).json({ message: 'Attendance marked successfully', name: studentName });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Attendance already marked for this slot today' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/attendance
// @desc    Get attendance records (with filters)
router.get('/', protect, async (req, res) => {
    const { date, startDate, endDate, subject_id } = req.query;
    
    try {
        let query = `
            SELECT a.id, a.attendance_date, a.attendance_time, a.status, a.verification_method, a.course_code, a.period_slot, s.roll_no, s.name, s.department, s.year,
                   sub.name as subject_name, sub.subject_code 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND a.attendance_date = ?';
            params.push(date);
        } else if (startDate && endDate) {
            query += ' AND a.attendance_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (subject_id) {
            query += ' AND a.subject_id = ?';
            params.push(subject_id);
        }

        query += ' ORDER BY a.attendance_date DESC, a.attendance_time DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance status (Manual Override)
router.put('/:id', protect, async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE attendance SET status = ?, verification_method = ? WHERE id = ?',
            [status, 'Manual Override', req.params.id]
        );
        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete an attendance record
router.delete('/:id', protect, async (req, res) => {
    try {
        await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
