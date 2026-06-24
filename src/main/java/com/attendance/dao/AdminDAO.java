package com.attendance.dao;

import com.attendance.model.Admin;
import com.attendance.util.DBConnection;

import java.sql.*;

/**
 * Data Access Object for Admin operations.
 * Uses JDBC prepared statements for SQL injection prevention.
 */
public class AdminDAO {

    /**
     * Find admin by username
     */
    public Admin findByUsername(String username) throws SQLException {
        String sql = "SELECT id, username, password FROM admins WHERE username = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, username);
            rs = stmt.executeQuery();

            if (rs.next()) {
                Admin admin = new Admin();
                admin.setId(rs.getInt("id"));
                admin.setUsername(rs.getString("username"));
                admin.setPassword(rs.getString("password"));
                return admin;
            }
            return null;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    /**
     * Create a new admin account
     */
    public int create(String username, String hashedPassword) throws SQLException {
        String sql = "INSERT INTO admins (username, password) VALUES (?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, username);
            stmt.setString(2, hashedPassword);
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
}
