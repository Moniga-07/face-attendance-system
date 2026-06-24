const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/user/profile
// @desc    Get user profile settings
router.get('/profile', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const [rows] = await pool.query(
                'SELECT id, username, faculty_name, faculty_id, course_name, course_code, period_slot, room_number FROM admins WHERE id = ?',
                [req.user.id]
            );
            if (rows.length > 0) {
                return res.json(rows[0]);
            }
        }
        res.status(404).json({ message: 'Profile not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile settings
router.put('/profile', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const { faculty_name, faculty_id, course_name, course_code, period_slot, room_number } = req.body;
            
            await pool.query(
                `UPDATE admins 
                 SET faculty_name = ?, faculty_id = ?, course_name = ?, course_code = ?, period_slot = ?, room_number = ? 
                 WHERE id = ?`,
                [faculty_name, faculty_id, course_name, course_code, period_slot, room_number, req.user.id]
            );
            
            return res.json({ message: 'Profile updated successfully' });
        }
        res.status(403).json({ message: 'Only admins can update this profile' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
