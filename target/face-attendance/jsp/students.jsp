<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Registered Students List - Face Attendance System">
    <title>Students — Face Attendance System</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="app-layout">
        <aside class="sidebar">
            <div class="sidebar-logo">
                <div class="logo-icon">👁️</div>
                <div>
                    <span class="logo-text">FaceAttend</span>
                    <span class="logo-sub">Multi-Face Scanner</span>
                </div>
            </div>
            <ul class="sidebar-nav">
                <li><a href="dashboard.jsp"><span class="nav-icon">📊</span><span>Dashboard</span></a></li>
                <li><a href="live-attendance.jsp"><span class="nav-icon">📸</span><span>Live Scanner</span></a></li>
                <li><a href="register-student.jsp"><span class="nav-icon">➕</span><span>Register Student</span></a></li>
                <li><a href="students.jsp" class="active"><span class="nav-icon">👨‍🎓</span><span>Students</span></a></li>
                <li><a href="reports.jsp"><span class="nav-icon">📋</span><span>Reports</span></a></li>
                <li style="margin-top:auto;"><button onclick="Auth.logout()"><span class="nav-icon">🚪</span><span>Logout</span></button></li>
            </ul>
        </aside>

        <main class="main-content">
            <div class="page-header flex justify-between items-center">
                <div>
                    <h1>Registered Students</h1>
                    <p>Manage all registered students and their face profiles</p>
                </div>
                <a href="register-student.jsp" class="btn btn-primary">
                    ➕ Add Student
                </a>
            </div>

            <div class="card">
                <div id="students-table">
                    <div class="loading-overlay">
                        <div class="spinner"></div>
                        <p>Loading students...</p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script>
        Auth.requireAuth();

        async function loadStudents() {
            try {
                const students = await API.get('/api/students');
                renderTable('students-table',
                    [
                        { key: 'roll_no', label: 'Roll No' },
                        { key: 'name', label: 'Name' },
                        { key: 'department', label: 'Department' },
                        { key: 'year', label: 'Year' },
                        { key: 'created_at', label: 'Registered', render: (v) => v ? DateUtil.formatDate(v) : '-' }
                    ],
                    students,
                    [
                        {
                            label: '🗑️',
                            className: 'btn-danger',
                            handler: (row) => deleteStudent(row.id, row.name)
                        }
                    ]
                );
            } catch (error) {
                Toast.error('Failed to load students');
                console.error(error);
            }
        }

        async function deleteStudent(id, name) {
            showModal(
                'Delete Student',
                `<p>Are you sure you want to delete <strong>${name}</strong>?</p>
                 <p class="text-sm text-muted mt-2">This will also delete all their attendance records.</p>`,
                async () => {
                    try {
                        await API.delete('/api/students/' + id);
                        Toast.success('Student deleted');
                        loadStudents();
                    } catch (error) {
                        Toast.error('Failed to delete student');
                    }
                }
            );
        }

        loadStudents();
    </script>
</body>
</html>
