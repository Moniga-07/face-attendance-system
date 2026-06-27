package com.attendance.servlet;

import com.attendance.dao.SubjectDAO;
import com.attendance.model.Subject;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

public class SubjectServlet extends HttpServlet {

    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        try {
            if ("/my-subjects".equals(pathInfo)) {
                // Return all subjects for admins (for now, assume admin role)
                List<Subject> list = subjectDAO.getAllSubjects();
                resp.getWriter().write(gson.toJson(list));
            } else {
                List<Subject> list = subjectDAO.getAllSubjects();
                resp.getWriter().write(gson.toJson(list));
            }
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

        String pathInfo = req.getPathInfo();
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            JsonObject body = gson.fromJson(sb.toString(), JsonObject.class);

            if ("/assign".equals(pathInfo)) {
                int facultyId = body.get("faculty_id").getAsInt();
                int subjectId = body.get("subject_id").getAsInt();

                try {
                    subjectDAO.assignSubjectToFaculty(facultyId, subjectId);
                    JsonObject res = new JsonObject();
                    res.addProperty("message", "Subject assigned successfully");
                    resp.setStatus(HttpServletResponse.SC_OK);
                    resp.getWriter().write(gson.toJson(res));
                } catch (java.sql.SQLIntegrityConstraintViolationException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write("{\"message\": \"Subject already assigned to this faculty\"}");
                }
            } else {
                String subjectCode = body.get("subject_code").getAsString();
                String name = body.get("name").getAsString();
                String department = body.get("department").getAsString();
                String year = body.get("year").getAsString();

                if (subjectDAO.existsByCode(subjectCode)) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write("{\"message\": \"Subject already exists\"}");
                    return;
                }

                Subject s = new Subject(0, subjectCode, name, department, year);
                int id = subjectDAO.createSubject(s);

                JsonObject res = new JsonObject();
                res.addProperty("message", "Subject created successfully");
                res.addProperty("id", id);
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write(gson.toJson(res));
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error\"}");
        }
    }
}
