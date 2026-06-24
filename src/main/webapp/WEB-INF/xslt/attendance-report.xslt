<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">
        <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <title>Attendance Report</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #0f172a;
                    color: #e2e8f0;
                    padding: 40px;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: rgba(30, 41, 59, 0.8);
                    border-radius: 20px;
                    padding: 40px;
                    border: 1px solid rgba(100, 116, 139, 0.3);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                }
                h1 {
                    font-size: 28px;
                    background: linear-gradient(135deg, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 8px;
                }
                .meta {
                    color: #94a3b8;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .stats {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(51, 65, 85, 0.5);
                    padding: 16px 24px;
                    border-radius: 12px;
                    border: 1px solid rgba(100, 116, 139, 0.3);
                }
                .stat-card .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
                .stat-card .value { font-size: 24px; font-weight: 700; color: #60a5fa; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
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
                .status-present {
                    color: #4ade80;
                    font-weight: 600;
                }
                .status-late {
                    color: #fbbf24;
                    font-weight: 600;
                }
                .status-absent {
                    color: #f87171;
                    font-weight: 600;
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
                <h1>📊 Attendance Report</h1>
                <p class="meta">
                    Generated on: <xsl:value-of select="attendance-report/generated-date"/>
                </p>

                <div class="stats">
                    <div class="stat-card">
                        <div class="label">Total Records</div>
                        <div class="value"><xsl:value-of select="attendance-report/total-records"/></div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <xsl:for-each select="attendance-report/records/record">
                            <tr>
                                <td><xsl:value-of select="position()"/></td>
                                <td><xsl:value-of select="roll-no"/></td>
                                <td><xsl:value-of select="student-name"/></td>
                                <td><xsl:value-of select="department"/></td>
                                <td><xsl:value-of select="year"/></td>
                                <td><xsl:value-of select="date"/></td>
                                <td><xsl:value-of select="time"/></td>
                                <td>
                                    <xsl:attribute name="class">
                                        <xsl:choose>
                                            <xsl:when test="status='Present'">status-present</xsl:when>
                                            <xsl:when test="status='Late'">status-late</xsl:when>
                                            <xsl:otherwise>status-absent</xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:attribute>
                                    <xsl:value-of select="status"/>
                                </td>
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
