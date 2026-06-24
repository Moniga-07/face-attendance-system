package com.attendance.dao;

import com.attendance.model.Attendance;
import com.attendance.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Attendance operations.
 * Uses JDBC prepared statements for SQL injection prevention.
 */
public class AttendanceDAO {

    /**
     * Mark attendance for a student
     */
    public void markAttendance(int studentId, String dateStr, String timeStr, String status) throws SQLException {
        String sql = "INSERT INTO attendance (student_id, attendance_date, attendance_time, status) VALUES (?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, studentId);
            stmt.setDate(2, Date.valueOf(dateStr));
            stmt.setTime(3, Time.valueOf(timeStr));
            stmt.setString(4, status);
            stmt.executeUpdate();
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    /**
     * Get student name by ID (for attendance confirmation)
     */
    public String getStudentName(int studentId) throws SQLException {
        String sql = "SELECT name FROM students WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, studentId);
            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("name");
            }
            return "Unknown";
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    /**
     * Get attendance records with optional date filters
     */
    public List<Attendance> findAll(String date, String startDate, String endDate) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT a.id, a.attendance_date, a.attendance_time, a.status, " +
            "s.roll_no, s.name, s.department, s.year " +
            "FROM attendance a JOIN students s ON a.student_id = s.id"
        );
        List<Object> params = new ArrayList<>();

        if (date != null && !date.isEmpty()) {
            sql.append(" WHERE a.attendance_date = ?");
            params.add(Date.valueOf(date));
        } else if (startDate != null && endDate != null && !startDate.isEmpty() && !endDate.isEmpty()) {
            sql.append(" WHERE a.attendance_date BETWEEN ? AND ?");
            params.add(Date.valueOf(startDate));
            params.add(Date.valueOf(endDate));
        }

        sql.append(" ORDER BY a.attendance_date DESC, a.attendance_time DESC");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<Attendance> records = new ArrayList<>();

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                Object param = params.get(i);
                if (param instanceof Date) {
                    stmt.setDate(i + 1, (Date) param);
                } else {
                    stmt.setString(i + 1, param.toString());
                }
            }
            rs = stmt.executeQuery();

            while (rs.next()) {
                Attendance a = new Attendance();
                a.setId(rs.getInt("id"));
                a.setAttendanceDate(rs.getDate("attendance_date"));
                a.setAttendanceTime(rs.getTime("attendance_time"));
                a.setStatus(rs.getString("status"));
                a.setRollNo(rs.getString("roll_no"));
                a.setStudentName(rs.getString("name"));
                a.setDepartment(rs.getString("department"));
                a.setYear(rs.getString("year"));
                records.add(a);
            }
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
        return records;
    }

    /**
     * Get today's attendance count
     */
    public int getTodayCount() throws SQLException {
        String sql = "SELECT COUNT(*) as total FROM attendance WHERE attendance_date = CURDATE()";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("total");
            }
            return 0;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    /**
     * Get recent attendance records (for dashboard)
     */
    public List<Attendance> getRecent(int limit) throws SQLException {
        String sql = "SELECT a.id, a.attendance_date, a.attendance_time, a.status, " +
                     "s.roll_no, s.name, s.department, s.year " +
                     "FROM attendance a JOIN students s ON a.student_id = s.id " +
                     "ORDER BY a.attendance_date DESC, a.attendance_time DESC LIMIT ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<Attendance> records = new ArrayList<>();

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, limit);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Attendance a = new Attendance();
                a.setId(rs.getInt("id"));
                a.setAttendanceDate(rs.getDate("attendance_date"));
                a.setAttendanceTime(rs.getTime("attendance_time"));
                a.setStatus(rs.getString("status"));
                a.setRollNo(rs.getString("roll_no"));
                a.setStudentName(rs.getString("name"));
                a.setDepartment(rs.getString("department"));
                a.setYear(rs.getString("year"));
                records.add(a);
            }
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
        return records;
    }
}
