package com.attendance.servlet;

import com.attendance.dao.UserDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

public class UserServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        if ("/profile".equals(pathInfo)) {
            try {
                String adminIdStr = (String) req.getAttribute("adminId");
                if (adminIdStr == null) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    resp.getWriter().write("{\"message\": \"Unauthorized\"}");
                    return;
                }
                int adminId = Integer.parseInt(adminIdStr);
                JsonObject profile = userDAO.getProfile(adminId);

                if (profile != null) {
                    resp.getWriter().write(gson.toJson(profile));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    resp.getWriter().write("{\"message\": \"Profile not found\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"message\": \"Server error\"}");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"message\": \"Endpoint not found\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        if ("/profile".equals(pathInfo)) {
            try {
                String adminIdStr = (String) req.getAttribute("adminId");
                if (adminIdStr == null) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    resp.getWriter().write("{\"message\": \"Unauthorized\"}");
                    return;
                }
                int adminId = Integer.parseInt(adminIdStr);

                StringBuilder sb = new StringBuilder();
                BufferedReader reader = req.getReader();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }

                JsonObject body = gson.fromJson(sb.toString(), JsonObject.class);
                String facultyName = body.has("faculty_name") ? body.get("faculty_name").getAsString() : null;
                String facultyId = body.has("faculty_id") ? body.get("faculty_id").getAsString() : null;
                String courseName = body.has("course_name") ? body.get("course_name").getAsString() : null;
                String courseCode = body.has("course_code") ? body.get("course_code").getAsString() : null;
                String periodSlot = body.has("period_slot") ? body.get("period_slot").getAsString() : null;
                String roomNumber = body.has("room_number") ? body.get("room_number").getAsString() : null;

                userDAO.updateProfile(adminId, facultyName, facultyId, courseName, courseCode, periodSlot, roomNumber);

                resp.setStatus(HttpServletResponse.SC_OK);
                resp.getWriter().write("{\"message\": \"Profile updated successfully\"}");

            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"message\": \"Server error\"}");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"message\": \"Endpoint not found\"}");
        }
    }
}
