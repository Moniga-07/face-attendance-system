<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Attendance Reports - Face Attendance System">
    <title>Reports — Face Attendance System</title>
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
                <li><a href="students.jsp"><span class="nav-icon">👨‍🎓</span><span>Students</span></a></li>
                <li><a href="reports.jsp" class="active"><span class="nav-icon">📋</span><span>Reports</span></a></li>
                <li style="margin-top:auto;"><button onclick="Auth.logout()"><span class="nav-icon">🚪</span><span>Logout</span></button></li>
            </ul>
        </aside>

        <main class="main-content">
            <div class="page-header">
                <h1>Attendance Reports</h1>
                <p>Filter and export attendance records</p>
            </div>

            <!-- Filters -->
            <div class="card mb-6" style="padding: 24px;">
                <h2 style="font-size: 16px; margin-bottom: 16px;">Filters</h2>
                <div class="flex gap-4 items-center" style="flex-wrap: wrap;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" for="filter-date">Specific Date</label>
                        <input type="date" id="filter-date" class="form-input" style="width: 200px;">
                    </div>
                    <div style="color: var(--text-muted); padding-top: 20px;">— or —</div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" for="filter-start">Start Date</label>
                        <input type="date" id="filter-start" class="form-input" style="width: 200px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" for="filter-end">End Date</label>
                        <input type="date" id="filter-end" class="form-input" style="width: 200px;">
                    </div>
                    <div style="padding-top: 20px;">
                        <button class="btn btn-primary" onclick="loadReport()">🔍 Search</button>
                    </div>
                    <div style="padding-top: 20px;">
                        <button class="btn btn-ghost" onclick="clearFilters()">Clear</button>
                    </div>
                </div>

                <!-- Export buttons -->
                <div class="flex gap-3 mt-4">
                    <button class="btn btn-ghost" onclick="exportCSV()">📥 Export CSV</button>
                    <a id="xml-report-link" href="../api/report/attendance?format=xml" target="_blank" class="btn btn-ghost">
                        📄 View XML
                    </a>
                    <a id="xslt-report-link" href="../api/report/attendance?format=html" target="_blank" class="btn btn-ghost">
                        🎨 XSLT Report
                    </a>
                    <a href="../api/report/students?format=html" target="_blank" class="btn btn-ghost">
                        👨‍🎓 Student Report (XSLT)
                    </a>
                </div>
            </div>

            <!-- Results -->
            <div class="card">
                <div id="report-table">
                    <div class="empty-state">
                        <div class="icon">📊</div>
                        <p>Select a date or date range and click Search</p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script>
        Auth.requireAuth();

        let currentData = [];

        async function loadReport() {
            const date = document.getElementById('filter-date').value;
            const startDate = document.getElementById('filter-start').value;
            const endDate = document.getElementById('filter-end').value;

            let url = '/api/attendance?';
            let xmlUrl = '../api/report/attendance?format=xml&';
            let xsltUrl = '../api/report/attendance?format=html&';

            if (date) {
                url += 'date=' + date;
                xmlUrl += 'date=' + date;
                xsltUrl += 'date=' + date;
            } else if (startDate && endDate) {
                url += 'startDate=' + startDate + '&endDate=' + endDate;
                xmlUrl += 'startDate=' + startDate + '&endDate=' + endDate;
                xsltUrl += 'startDate=' + startDate + '&endDate=' + endDate;
            } else {
                url += 'date=' + DateUtil.today();
                xmlUrl += 'date=' + DateUtil.today();
                xsltUrl += 'date=' + DateUtil.today();
            }

            // Update XML/XSLT report links
            document.getElementById('xml-report-link').href = xmlUrl;
            document.getElementById('xslt-report-link').href = xsltUrl;

            document.getElementById('report-table').innerHTML =
                '<div class="loading-overlay"><div class="spinner"></div><p>Loading...</p></div>';

            try {
                const records = await API.get(url);
                currentData = records;

                renderTable('report-table',
                    [
                        { key: 'roll_no', label: 'Roll No' },
                        { key: 'name', label: 'Student' },
                        { key: 'department', label: 'Department' },
                        { key: 'year', label: 'Year' },
                        { key: 'attendance_date', label: 'Date', render: (v) => DateUtil.formatDate(v) },
                        { key: 'attendance_time', label: 'Time', render: (v) => DateUtil.formatTime(v) },
                        {
                            key: 'status', label: 'Status', html: true,
                            render: (v) => {
                                const cls = v === 'Present' ? 'badge-success' :
                                            v === 'Late' ? 'badge-warning' : 'badge-danger';
                                return `<span class="badge ${cls}">${v}</span>`;
                            }
                        }
                    ],
                    records
                );
            } catch (error) {
                Toast.error('Failed to load report');
                console.error(error);
            }
        }

        function clearFilters() {
            document.getElementById('filter-date').value = '';
            document.getElementById('filter-start').value = '';
            document.getElementById('filter-end').value = '';
            document.getElementById('report-table').innerHTML =
                '<div class="empty-state"><div class="icon">📊</div><p>Select a date or date range and click Search</p></div>';
        }

        function exportCSV() {
            if (currentData.length === 0) {
                Toast.warning('No data to export. Run a search first.');
                return;
            }

            const headers = ['Roll No', 'Name', 'Department', 'Year', 'Date', 'Time', 'Status'];
            const rows = currentData.map(r => [
                r.roll_no, r.name, r.department, r.year,
                r.attendance_date, r.attendance_time, r.status
            ]);

            let csv = headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(v => `"${v}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance_report.csv';
            a.click();
            URL.revokeObjectURL(url);

            Toast.success('CSV exported!');
        }

        // Load today's report by default
        document.getElementById('filter-date').value = DateUtil.today();
        loadReport();
    </script>
</body>
</html>
