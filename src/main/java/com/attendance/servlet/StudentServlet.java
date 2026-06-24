package com.attendance.servlet;

import com.attendance.dao.StudentDAO;
import com.attendance.model.Student;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

/**
 * Student Servlet - Handles all student CRUD operations.
 * GET  /api/students              - List all students
 * GET  /api/students/all-descriptors - Get students with face descriptors (for live attendance)
 * POST /api/students              - Register new student
 * PUT  /api/students/{id}         - Update student
 * DELETE /api/students/{id}       - Delete student
 */
public class StudentServlet extends HttpServlet {

    private final StudentDAO studentDAO = new StudentDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();

        try {
            if ("/all-descriptors".equals(pathInfo)) {
                // Public endpoint - returns students with face descriptors for matching
                List<Student> students = studentDAO.findAllWithDescriptors();
                JsonArray arr = new JsonArray();
                for (Student s : students) {
                    JsonObject obj = new JsonObject();
                    obj.addProperty("id", s.getId());
                    obj.addProperty("name", s.getName());
                    obj.addProperty("roll_no", s.getRollNo());
                    // Parse JSON string descriptor back to array
                    obj.add("face_descriptor", JsonParser.parseString(s.getFaceDescriptor()));
                    arr.add(obj);
                }
                resp.getWriter().write(gson.toJson(arr));
            } else {
                // Protected endpoint - list all students (without descriptors)
                List<Student> students = studentDAO.findAll();
                JsonArray arr = new JsonArray();
                for (Student s : students) {
                    JsonObject obj = new JsonObject();
                    obj.addProperty("id", s.getId());
                    obj.addProperty("roll_no", s.getRollNo());
                    obj.addProperty("name", s.getName());
                    obj.addProperty("department", s.getDepartment());
                    obj.addProperty("year", s.getYear());
                    obj.addProperty("created_at", s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
                    arr.add(obj);
                }
                resp.getWriter().write(gson.toJson(arr));
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String body = readBody(req);
            JsonObject json = gson.fromJson(body, JsonObject.class);

            Student student = new Student();
            student.setRollNo(json.get("roll_no").getAsString());
            student.setName(json.get("name").getAsString());
            student.setDepartment(json.get("department").getAsString());
            student.setYear(json.get("year").getAsString());
            // Store face descriptor as JSON string
            student.setFaceDescriptor(gson.toJson(json.get("face_descriptor")));

            int id = studentDAO.create(student);

            JsonObject response = new JsonObject();
            response.addProperty("message", "Student registered successfully");
            response.addProperty("id", id);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write(gson.toJson(response));

        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"message\": \"Roll number already exists\"}");
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"message\": \"Student ID required\"}");
                return;
            }

            int id = Integer.parseInt(pathInfo.substring(1));
            String body = readBody(req);
            JsonObject json = gson.fromJson(body, JsonObject.class);

            studentDAO.update(
                id,
                json.get("roll_no").getAsString(),
                json.get("name").getAsString(),
                json.get("department").getAsString(),
                json.get("year").getAsString()
            );

            resp.getWriter().write("{\"message\": \"Student updated successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"message\": \"Student ID required\"}");
                return;
            }

            int id = Integer.parseInt(pathInfo.substring(1));
            studentDAO.delete(id);
            resp.getWriter().write("{\"message\": \"Student deleted successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }

    private String readBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }
}
