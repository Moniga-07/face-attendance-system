<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Multi-Face Classroom Attendance System - Admin Login">
    <title>Login — Face Attendance System</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card glass">
            <div class="login-logo">
                <div class="icon">👁️</div>
                <h1>Face Attendance</h1>
                <p>Multi-Face Classroom Scanner</p>
            </div>

            <form id="login-form">
                <div class="form-group">
                    <label class="form-label" for="username">Username</label>
                    <input type="text" id="username" class="form-input" 
                           placeholder="Enter your username" required autofocus>
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input type="password" id="password" class="form-input" 
                           placeholder="Enter your password" required>
                </div>

                <button type="submit" id="login-btn" class="btn btn-primary btn-lg w-full mt-4">
                    Sign In
                </button>

                <p class="text-center text-sm text-muted mt-4">
                    Default credentials: admin / admin123
                </p>
            </form>
        </div>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script>
        // If already logged in, redirect to dashboard
        if (Auth.isLoggedIn()) {
            window.location.href = 'dashboard.jsp';
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('login-btn');
            btn.disabled = true;
            btn.textContent = 'Signing in...';

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const data = await API.post('/api/auth/login', { username, password });
                Auth.login(data.token, data.username);
                Toast.success('Login successful!');
                setTimeout(() => {
                    window.location.href = 'dashboard.jsp';
                }, 500);
            } catch (error) {
                Toast.error(error.message || 'Invalid credentials');
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        });
    </script>
</body>
</html>
