<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page isErrorPage="true" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error — Face Attendance System</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card glass text-center">
            <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
            <h1 style="font-size: 24px; margin-bottom: 8px;">Something went wrong</h1>
            <p class="text-secondary mb-4">
                <% if (response.getStatus() == 404) { %>
                    The page you're looking for doesn't exist.
                <% } else { %>
                    An unexpected error occurred. Please try again.
                <% } %>
            </p>
            <p class="text-muted text-sm mb-6">
                Error Code: <%= response.getStatus() %>
            </p>
            <a href="${pageContext.request.contextPath}/jsp/dashboard.jsp" class="btn btn-primary">
                ← Back to Dashboard
            </a>
        </div>
    </div>
</body>
</html>
