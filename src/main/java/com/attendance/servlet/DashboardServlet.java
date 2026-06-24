package com.attendance.servlet;

import com.attendance.dao.AttendanceDAO;
import com.attendance.dao.StudentDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Dashboard Servlet - Provides summary statistics for the admin dashboard.
 * GET /api/dashboard/stats - Returns total students, today's attendance count, etc.
 */
public class DashboardServlet extends HttpServlet {

    private final StudentDAO studentDAO = new StudentDAO();
    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();

        try {
            if ("/stats".equals(pathInfo)) {
                int totalStudents = studentDAO.getTotalCount();
                int todayAttendance = attendanceDAO.getTodayCount();

                JsonObject stats = new JsonObject();
                stats.addProperty("totalStudents", totalStudents);
                stats.addProperty("todayAttendance", todayAttendance);
                stats.addProperty("attendanceRate",
                    totalStudents > 0 ? Math.round((double) todayAttendance / totalStudents * 100) : 0);

                resp.getWriter().write(gson.toJson(stats));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.getWriter().write("{\"message\": \"Endpoint not found\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }
}
