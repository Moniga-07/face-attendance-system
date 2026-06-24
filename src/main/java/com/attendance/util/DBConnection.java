package com.attendance.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connection utility using JDBC.
 * Manages MySQL connections for the attendance system.
 */
public class DBConnection {

    private static String url;
    private static String user;
    private static String password;
    private static boolean initialized = false;

    /**
     * Initialize with context parameters from web.xml
     */
    public static void init(String dbUrl, String dbUser, String dbPassword) {
        url = dbUrl;
        user = dbUser;
        password = dbPassword;
        initialized = true;

        // Load MySQL JDBC driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found", e);
        }
    }

    /**
     * Get a new database connection
     */
    public static Connection getConnection() throws SQLException {
        if (!initialized) {
            throw new SQLException("DBConnection not initialized. Call init() first.");
        }
        return DriverManager.getConnection(url, user, password);
    }

    /**
     * Safely close a connection
     */
    public static void close(AutoCloseable... resources) {
        for (AutoCloseable resource : resources) {
            if (resource != null) {
                try {
                    resource.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
