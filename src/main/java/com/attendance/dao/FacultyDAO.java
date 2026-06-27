package com.attendance.dao;

import com.attendance.model.Faculty;
import com.attendance.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FacultyDAO {

    public int createFaculty(Faculty faculty) throws SQLException, SQLIntegrityConstraintViolationException {
        String sql = "INSERT INTO faculties (username, password, name, department) VALUES (?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, faculty.getUsername());
            stmt.setString(2, faculty.getPassword());
            stmt.setString(3, faculty.getName());
            stmt.setString(4, faculty.getDepartment());
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

    public List<Faculty> getAllFaculties() throws SQLException {
        String sql = "SELECT id, username, name, department FROM faculties";
        List<Faculty> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Faculty f = new Faculty();
                f.setId(rs.getInt("id"));
                f.setUsername(rs.getString("username"));
                f.setName(rs.getString("name"));
                f.setDepartment(rs.getString("department"));
                list.add(f);
            }
            return list;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public boolean existsByUsername(String username) throws SQLException {
        String sql = "SELECT 1 FROM faculties WHERE username = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, username);
            rs = stmt.executeQuery();
            return rs.next();
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }
}
