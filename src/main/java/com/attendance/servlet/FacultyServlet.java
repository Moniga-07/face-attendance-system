package com.attendance.servlet;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.attendance.dao.FacultyDAO;
import com.attendance.model.Faculty;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

public class FacultyServlet extends HttpServlet {

    private final FacultyDAO facultyDAO = new FacultyDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            List<Faculty> list = facultyDAO.getAllFaculties();
            resp.getWriter().write(gson.toJson(list));
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
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
            String username = body.get("username").getAsString();
            String password = body.get("password").getAsString();
            String name = body.get("name").getAsString();
            String department = body.get("department").getAsString();

            if (facultyDAO.existsByUsername(username)) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"message\": \"Faculty already exists\"}");
                return;
            }

            String hashedPassword = BCrypt.withDefaults().hashToString(10, password.toCharArray());

            Faculty f = new Faculty(0, username, hashedPassword, name, department);
            int id = facultyDAO.createFaculty(f);

            JsonObject response = new JsonObject();
            response.addProperty("message", "Faculty registered successfully");
            response.addProperty("id", id);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write(gson.toJson(response));

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }
}
