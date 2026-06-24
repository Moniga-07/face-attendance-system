package com.attendance.servlet;

import com.attendance.dao.AttendanceDAO;
import com.attendance.model.Attendance;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

/**
 * Attendance Servlet - Handles attendance marking and retrieval.
 * POST /api/attendance           - Mark attendance (public for kiosk/scanner mode)
 * GET  /api/attendance           - Get attendance records with filters
 */
public class AttendanceServlet extends HttpServlet {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            JsonObject body = gson.fromJson(sb.toString(), JsonObject.class);
            int studentId = body.get("student_id").getAsInt();
            String attendanceDate = body.get("attendance_date").getAsString();
            String attendanceTime = body.get("attendance_time").getAsString();

            // Determine status based on current minute of the hour (demo for Timetable Grace Period)
            java.time.LocalTime now = java.time.LocalTime.now();
            int minute = now.getMinute();
            String status = "Present";
            if (minute >= 11 && minute <= 20) {
                status = "Late";
            } else if (minute > 20) {
                status = "Absent";
            }

            attendanceDAO.markAttendance(studentId, attendanceDate, attendanceTime, status);

            // Get student name for response
            String studentName = attendanceDAO.getStudentName(studentId);

            JsonObject response = new JsonObject();
            response.addProperty("message", "Attendance marked successfully");
            response.addProperty("name", studentName);

            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write(gson.toJson(response));

        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"message\": \"Attendance already marked for today\"}");
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String date = req.getParameter("date");
            String startDate = req.getParameter("startDate");
            String endDate = req.getParameter("endDate");

            List<Attendance> records = attendanceDAO.findAll(date, startDate, endDate);

            JsonArray arr = new JsonArray();
            for (Attendance a : records) {
                JsonObject obj = new JsonObject();
                obj.addProperty("id", a.getId());
                obj.addProperty("attendance_date", a.getAttendanceDate().toString());
                obj.addProperty("attendance_time", a.getAttendanceTime().toString());
                obj.addProperty("status", a.getStatus());
                obj.addProperty("roll_no", a.getRollNo());
                obj.addProperty("name", a.getStudentName());
                obj.addProperty("department", a.getDepartment());
                obj.addProperty("year", a.getYear());
                arr.add(obj);
            }

            resp.getWriter().write(gson.toJson(arr));

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }
}
