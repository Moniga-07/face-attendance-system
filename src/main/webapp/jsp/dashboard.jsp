<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Admin Dashboard - Multi-Face Classroom Attendance System">
    <title>Dashboard — Face Attendance System</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="app-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-logo">
                <div class="logo-icon">👁️</div>
                <div>
                    <span class="logo-text">FaceAttend</span>
                    <span class="logo-sub">Multi-Face Scanner</span>
                </div>
            </div>

            <ul class="sidebar-nav">
                <li>
                    <a href="dashboard.jsp" class="active" id="nav-dashboard">
                        <span class="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="live-attendance.jsp" id="nav-attendance">
                        <span class="nav-icon">📸</span>
                        <span>Live Scanner</span>
                    </a>
                </li>
                <li>
                    <a href="register-student.jsp" id="nav-register">
                        <span class="nav-icon">➕</span>
                        <span>Register Student</span>
                    </a>
                </li>
                <li>
                    <a href="students.jsp" id="nav-students">
                        <span class="nav-icon">👨‍🎓</span>
                        <span>Students</span>
                    </a>
                </li>
                <li>
                    <a href="reports.jsp" id="nav-reports">
                        <span class="nav-icon">📋</span>
                        <span>Reports</span>
                    </a>
                </li>
                <li style="margin-top: auto;">
                    <button onclick="Auth.logout()" id="nav-logout">
                        <span class="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back, <span id="admin-name">Admin</span></p>
            </div>

            <!-- Stats Cards -->
            <div class="card-grid" id="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">👨‍🎓</div>
                    <div class="stat-value" id="total-students">—</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value" id="today-attendance">—</div>
                    <div class="stat-label">Present Today</div>
                </div>
                <div class="stat-card amber">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value" id="attendance-rate">—%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon">📸</div>
                    <div class="stat-value" id="scan-mode">Ready</div>
                    <div class="stat-label">Scanner Status</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mb-6" style="padding: 24px;">
                <h2 style="font-size: 18px; margin-bottom: 16px;">Quick Actions</h2>
                <div class="flex gap-3">
                    <a href="live-attendance.jsp" class="btn btn-primary">
                        📸 Start Live Scanner
                    </a>
                    <a href="register-student.jsp" class="btn btn-success">
                        ➕ Register Student
                    </a>
                    <a href="reports.jsp" class="btn btn-ghost">
                        📋 View Reports
                    </a>
                    <a href="../api/report/attendance?format=html" target="_blank" class="btn btn-ghost">
                        📄 XML/XSLT Report
                    </a>
                    <a href="../ws/attendance?wsdl" target="_blank" class="btn btn-ghost">
                        🔗 SOAP WSDL
                    </a>
                </div>
            </div>

            <!-- Recent Attendance -->
            <div class="card">
                <h2 style="font-size: 18px; margin-bottom: 16px;">Recent Attendance</h2>
                <div id="recent-table">
                    <div class="loading-overlay">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script>
        // Auth check
        Auth.requireAuth();
        document.getElementById('admin-name').textContent = Auth.getUsername();

        // Load dashboard data
        async function loadDashboard() {
            try {
                const stats = await API.get('/api/dashboard/stats');
                document.getElementById('total-students').textContent = stats.totalStudents;
                document.getElementById('today-attendance').textContent = stats.todayAttendance;
                document.getElementById('attendance-rate').textContent = stats.attendanceRate + '%';
            } catch (error) {
                console.error('Failed to load stats:', error);
            }

            // Load recent attendance
            try {
                const records = await API.get('/api/attendance?date=' + DateUtil.today());
                renderTable('recent-table',
                    [
                        { key: 'roll_no', label: 'Roll No' },
                        { key: 'name', label: 'Student' },
                        { key: 'department', label: 'Department' },
                        { key: 'attendance_time', label: 'Time', render: (v) => DateUtil.formatTime(v) },
                        { key: 'status', label: 'Status', html: true, render: (v) => {
                            const cls = v === 'Present' ? 'badge-success' :
                                        v === 'Late' ? 'badge-warning' : 'badge-danger';
                            return `<span class="badge ${cls}">${v}</span>`;
                        } }
                    ],
                    records
                );
            } catch (error) {
                document.getElementById('recent-table').innerHTML =
                    '<div class="empty-state"><div class="icon">📭</div><p>No attendance records for today</p></div>';
            }
        }

        loadDashboard();
    </script>
</body>
</html>
