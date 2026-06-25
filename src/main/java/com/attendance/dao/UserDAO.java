package com.attendance.dao;

import com.attendance.util.DBConnection;
import com.google.gson.JsonObject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {

    public JsonObject getProfile(int adminId) throws SQLException {
        String sql = "SELECT id, username, faculty_name, faculty_id, course_name, course_code, period_slot, room_number FROM admins WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, adminId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                JsonObject obj = new JsonObject();
                obj.addProperty("id", rs.getInt("id"));
                obj.addProperty("username", rs.getString("username"));
                obj.addProperty("faculty_name", rs.getString("faculty_name"));
                obj.addProperty("faculty_id", rs.getString("faculty_id"));
                obj.addProperty("course_name", rs.getString("course_name"));
                obj.addProperty("course_code", rs.getString("course_code"));
                obj.addProperty("period_slot", rs.getString("period_slot"));
                obj.addProperty("room_number", rs.getString("room_number"));
                return obj;
            }
            return null;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public void updateProfile(int adminId, String facultyName, String facultyId, String courseName, String courseCode, String periodSlot, String roomNumber) throws SQLException {
        String sql = "UPDATE admins SET faculty_name = ?, faculty_id = ?, course_name = ?, course_code = ?, period_slot = ?, room_number = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, facultyName);
            stmt.setString(2, facultyId);
            stmt.setString(3, courseName);
            stmt.setString(4, courseCode);
            stmt.setString(5, periodSlot);
            stmt.setString(6, roomNumber);
            stmt.setInt(7, adminId);
            stmt.executeUpdate();
        } finally {
            DBConnection.close(stmt, conn);
        }
    }
}
