package com.attendance.dao;

import com.attendance.model.Student;
import com.attendance.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Student operations.
 * Uses JDBC prepared statements for SQL injection prevention.
 */
public class StudentDAO {

    /**
     * Get all students (without face descriptors, for listing)
     */
    public List<Student> findAll() throws SQLException {
        String sql = "SELECT id, roll_no, name, department, year, created_at FROM students ORDER BY created_at DESC";
        List<Student> students = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Student s = new Student();
                s.setId(rs.getInt("id"));
                s.setRollNo(rs.getString("roll_no"));
                s.setName(rs.getString("name"));
                s.setDepartment(rs.getString("department"));
                s.setYear(rs.getString("year"));
                s.setCreatedAt(rs.getTimestamp("created_at"));
                students.add(s);
            }
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
        return students;
    }

    /**
     * Get all students WITH face descriptors (for face matching on live attendance)
     */
    public List<Student> findAllWithDescriptors() throws SQLException {
        String sql = "SELECT id, name, roll_no, face_descriptor FROM students";
        List<Student> students = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Student s = new Student();
                s.setId(rs.getInt("id"));
                s.setName(rs.getString("name"));
                s.setRollNo(rs.getString("roll_no"));
                s.setFaceDescriptor(rs.getString("face_descriptor"));
                students.add(s);
            }
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
        return students;
    }

    /**
     * Find a student by ID
     */
    public Student findById(int id) throws SQLException {
        String sql = "SELECT id, roll_no, name, department, year, face_descriptor, created_at FROM students WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                Student s = new Student();
                s.setId(rs.getInt("id"));
                s.setRollNo(rs.getString("roll_no"));
                s.setName(rs.getString("name"));
                s.setDepartment(rs.getString("department"));
                s.setYear(rs.getString("year"));
                s.setFaceDescriptor(rs.getString("face_descriptor"));
                s.setCreatedAt(rs.getTimestamp("created_at"));
                return s;
            }
            return null;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    /**
     * Create a new student
     */
    public int create(Student student) throws SQLException {
        String sql = "INSERT INTO students (roll_no, name, department, year, face_descriptor) VALUES (?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, student.getRollNo());
            stmt.setString(2, student.getName());
            stmt.setString(3, student.getDepartment());
            stmt.setString(4, student.getYear());
            stmt.setString(5, student.getFaceDescriptor());
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                return keys.getInt(1);
            }
            return -1;
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    /**
     * Update student details (without face descriptor)
     */
    public void update(int id, String rollNo, String name, String department, String year) throws SQLException {
        String sql = "UPDATE students SET roll_no = ?, name = ?, department = ?, year = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, rollNo);
            stmt.setString(2, name);
            stmt.setString(3, department);
            stmt.setString(4, year);
            stmt.setInt(5, id);
            stmt.executeUpdate();
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    /**
     * Delete a student by ID
     */
    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM students WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            stmt.executeUpdate();
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    /**
     * Get total number of students
     */
    public int getTotalCount() throws SQLException {
        String sql = "SELECT COUNT(*) as total FROM students";
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
}
