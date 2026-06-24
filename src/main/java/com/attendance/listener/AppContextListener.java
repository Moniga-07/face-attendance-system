package com.attendance.listener;

import com.attendance.util.DBConnection;
import com.attendance.util.JWTUtil;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

/**
 * Application startup listener.
 * Initializes database connection and JWT utility from web.xml context params.
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();

        // Initialize database connection
        String dbUrl = ctx.getInitParameter("dbUrl");
        String dbUser = ctx.getInitParameter("dbUser");
        String dbPassword = ctx.getInitParameter("dbPassword");
        DBConnection.init(dbUrl, dbUser, dbPassword);

        // Initialize JWT
        String jwtSecret = ctx.getInitParameter("jwtSecret");
        JWTUtil.init(jwtSecret);

        System.out.println("=== Multi-Face Attendance System Initialized ===");
        System.out.println("Database URL: " + dbUrl);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("=== Multi-Face Attendance System Shutting Down ===");
    }
}
