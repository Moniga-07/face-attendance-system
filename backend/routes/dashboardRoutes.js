const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for today
router.get('/stats', protect, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Total Students
        const [studentRows] = await pool.query('SELECT COUNT(*) as total FROM students');
        const totalStudents = studentRows[0].total;

        // Present Today
        const [presentRows] = await pool.query('SELECT COUNT(*) as present FROM attendance WHERE attendance_date = ?', [today]);
        const presentToday = presentRows[0].present;

        // Absent Today
        const absentToday = totalStudents - presentToday;

        // Attendance Percentage
        const attendancePercentage = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;

        res.json({
            totalStudents,
            presentToday,
            absentToday,
            attendancePercentage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
