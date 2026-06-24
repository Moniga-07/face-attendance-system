package com.attendance.filter;

import com.attendance.util.JWTUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Authentication Filter - Validates JWT tokens on protected routes.
 * Intercepts requests and checks for valid Authorization header.
 */
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // Check for Authorization header
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"message\": \"No token provided. Authorization denied.\"}");
            return;
        }

        // Extract and validate token
        String token = authHeader.substring(7);
        Claims claims = JWTUtil.validateToken(token);

        if (claims == null) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"message\": \"Invalid or expired token.\"}");
            return;
        }

        // Set admin info on the request for downstream servlets
        httpRequest.setAttribute("adminId", claims.getSubject());
        httpRequest.setAttribute("username", claims.get("username", String.class));

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
