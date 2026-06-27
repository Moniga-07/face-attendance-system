package com.attendance.dao;

import com.attendance.model.Subject;
import com.attendance.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SubjectDAO {

    public int createSubject(Subject subject) throws SQLException {
        String sql = "INSERT INTO subjects (subject_code, name, department, year) VALUES (?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, subject.getSubjectCode());
            stmt.setString(2, subject.getName());
            stmt.setString(3, subject.getDepartment());
            stmt.setString(4, subject.getYear());
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

    public List<Subject> getAllSubjects() throws SQLException {
        String sql = "SELECT * FROM subjects";
        return fetchSubjects(sql, null);
    }

    public List<Subject> getSubjectsByFaculty(int facultyId) throws SQLException {
        String sql = "SELECT s.* FROM subjects s JOIN faculty_subjects fs ON s.id = fs.subject_id WHERE fs.faculty_id = ?";
        return fetchSubjects(sql, facultyId);
    }

    private List<Subject> fetchSubjects(String sql, Integer param) throws SQLException {
        List<Subject> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            if (param != null) {
                stmt.setInt(1, param);
            }
            rs = stmt.executeQuery();

            while (rs.next()) {
                Subject s = new Subject();
                s.setId(rs.getInt("id"));
                s.setSubjectCode(rs.getString("subject_code"));
                s.setName(rs.getString("name"));
                s.setDepartment(rs.getString("department"));
                s.setYear(rs.getString("year"));
                list.add(s);
            }
            return list;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public void assignSubjectToFaculty(int facultyId, int subjectId) throws SQLException {
        String sql = "INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, facultyId);
            stmt.setInt(2, subjectId);
            stmt.executeUpdate();
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    public boolean existsByCode(String code) throws SQLException {
        String sql = "SELECT 1 FROM subjects WHERE subject_code = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, code);
            rs = stmt.executeQuery();
            return rs.next();
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }
}
