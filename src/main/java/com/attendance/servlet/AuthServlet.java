package com.attendance.servlet;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.attendance.dao.AdminDAO;
import com.attendance.model.Admin;
import com.attendance.util.JWTUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

/**
 * Authentication Servlet - Handles admin login.
 * POST /api/auth/login - Authenticates admin and returns JWT token.
 */
public class AuthServlet extends HttpServlet {

    private final AdminDAO adminDAO = new AdminDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();

        if ("/login".equals(pathInfo)) {
            handleLogin(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"message\": \"Endpoint not found\"}");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            // Read JSON body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            JsonObject body = gson.fromJson(sb.toString(), JsonObject.class);
            String username = body.has("username") ? body.get("username").getAsString() : "";
            String password = body.has("password") ? body.get("password").getAsString() : "";

            if (username.isEmpty() || password.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"message\": \"Username and password are required\"}");
                return;
            }

            // Find admin by username
            Admin admin = adminDAO.findByUsername(username);

            if (admin == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"message\": \"Invalid credentials\"}");
                return;
            }

            // Verify password with BCrypt
            BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), admin.getPassword());

            if (!result.verified) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"message\": \"Invalid credentials\"}");
                return;
            }

            // Generate JWT token
            String token = JWTUtil.generateToken(admin.getId(), admin.getUsername());

            JsonObject responseJson = new JsonObject();
            responseJson.addProperty("token", token);
            responseJson.addProperty("username", admin.getUsername());
            responseJson.addProperty("message", "Login successful");

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write(gson.toJson(responseJson));

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\": \"Server error: " + e.getMessage() + "\"}");
        }
    }
}
