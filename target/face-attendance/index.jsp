<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Face Attendance System</title>
    <script>
        // Redirect to dashboard if logged in, else to login
        if (localStorage.getItem('token')) {
            window.location.href = 'jsp/dashboard.jsp';
        } else {
            window.location.href = 'jsp/login.jsp';
        }
    </script>
</head>
<body></body>
</html>
