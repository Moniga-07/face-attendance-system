<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">
        <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <title>Student List Report</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #0f172a;
                    color: #e2e8f0;
                    padding: 40px;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: rgba(30, 41, 59, 0.8);
                    border-radius: 20px;
                    padding: 40px;
                    border: 1px solid rgba(100, 116, 139, 0.3);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                }
                h1 {
                    font-size: 28px;
                    background: linear-gradient(135deg, #34d399, #60a5fa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 8px;
                }
                .meta {
                    color: #94a3b8;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .stat-card {
                    background: rgba(51, 65, 85, 0.5);
                    padding: 16px 24px;
                    border-radius: 12px;
                    border: 1px solid rgba(100, 116, 139, 0.3);
                    display: inline-block;
                    margin-bottom: 24px;
                }
                .stat-card .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
                .stat-card .value { font-size: 24px; font-weight: 700; color: #34d399; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: rgba(51, 65, 85, 0.8);
                    padding: 12px 16px;
                    text-align: left;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #94a3b8;
                    border-bottom: 2px solid rgba(100, 116, 139, 0.3);
                }
                td {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(100, 116, 139, 0.15);
                    font-size: 14px;
                }
                tr:hover td {
                    background: rgba(51, 65, 85, 0.3);
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #64748b;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>👨‍🎓 Registered Students</h1>
                <p class="meta">Student Directory Report</p>

                <div class="stat-card">
                    <div class="label">Total Students</div>
                    <div class="value"><xsl:value-of select="student-list/total-students"/></div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Registered</th>
                        </tr>
                    </thead>
                    <tbody>
                        <xsl:for-each select="student-list/students/student">
                            <tr>
                                <td><xsl:value-of select="position()"/></td>
                                <td><xsl:value-of select="roll-no"/></td>
                                <td><xsl:value-of select="name"/></td>
                                <td><xsl:value-of select="department"/></td>
                                <td><xsl:value-of select="year"/></td>
                                <td><xsl:value-of select="registered-date"/></td>
                            </tr>
                        </xsl:for-each>
                    </tbody>
                </table>

                <p class="footer">Multi-Face Classroom Attendance System — XSLT Generated Report</p>
            </div>
        </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
