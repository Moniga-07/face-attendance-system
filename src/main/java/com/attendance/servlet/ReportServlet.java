package com.attendance.servlet;

import com.attendance.dao.AttendanceDAO;
import com.attendance.dao.StudentDAO;
import com.attendance.model.Attendance;
import com.attendance.model.Student;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;

/**
 * Report Servlet - Generates attendance reports in XML format 
 * and applies XSLT transformations for HTML output.
 * 
 * GET /api/report/attendance?format=xml   - Raw XML attendance data
 * GET /api/report/attendance?format=html  - XSLT-transformed HTML report
 * GET /api/report/students?format=xml     - Raw XML student list
 * GET /api/report/students?format=html    - XSLT-transformed HTML student list
 */
public class ReportServlet extends HttpServlet {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String pathInfo = req.getPathInfo();
        String format = req.getParameter("format");
        if (format == null) format = "xml";

        String date = req.getParameter("date");
        String startDate = req.getParameter("startDate");
        String endDate = req.getParameter("endDate");

        try {
            if ("/attendance".equals(pathInfo)) {
                handleAttendanceReport(resp, format, date, startDate, endDate);
            } else if ("/students".equals(pathInfo)) {
                handleStudentReport(resp, format);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"message\": \"Report type not found\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.setContentType("application/json");
            resp.getWriter().write("{\"message\": \"Server error generating report\"}");
        }
    }

    private void handleAttendanceReport(HttpServletResponse resp, String format,
            String date, String startDate, String endDate) throws Exception {

        List<Attendance> records = attendanceDAO.findAll(date, startDate, endDate);

        // Build XML
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<?xml-stylesheet type=\"text/xsl\" href=\"/xslt/attendance-report.xslt\"?>\n");
        xml.append("<attendance-report>\n");
        xml.append("  <generated-date>").append(java.time.LocalDate.now()).append("</generated-date>\n");
        xml.append("  <total-records>").append(records.size()).append("</total-records>\n");
        xml.append("  <records>\n");

        for (Attendance a : records) {
            xml.append("    <record>\n");
            xml.append("      <roll-no>").append(escapeXml(a.getRollNo())).append("</roll-no>\n");
            xml.append("      <student-name>").append(escapeXml(a.getStudentName())).append("</student-name>\n");
            xml.append("      <department>").append(escapeXml(a.getDepartment())).append("</department>\n");
            xml.append("      <year>").append(escapeXml(a.getYear())).append("</year>\n");
            xml.append("      <date>").append(a.getAttendanceDate()).append("</date>\n");
            xml.append("      <time>").append(a.getAttendanceTime()).append("</time>\n");
            xml.append("      <status>").append(a.getStatus()).append("</status>\n");
            xml.append("    </record>\n");
        }

        xml.append("  </records>\n");
        xml.append("</attendance-report>");

        if ("html".equalsIgnoreCase(format)) {
            // Apply XSLT transformation
            String html = applyXslt(xml.toString(), "/WEB-INF/xslt/attendance-report.xslt");
            resp.setContentType("text/html");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(html);
        } else {
            // Return raw XML
            resp.setContentType("application/xml");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(xml.toString());
        }
    }

    private void handleStudentReport(HttpServletResponse resp, String format) throws Exception {
        List<Student> students = studentDAO.findAll();

        // Build XML
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<?xml-stylesheet type=\"text/xsl\" href=\"/xslt/student-list.xslt\"?>\n");
        xml.append("<student-list>\n");
        xml.append("  <total-students>").append(students.size()).append("</total-students>\n");
        xml.append("  <students>\n");

        for (Student s : students) {
            xml.append("    <student>\n");
            xml.append("      <id>").append(s.getId()).append("</id>\n");
            xml.append("      <roll-no>").append(escapeXml(s.getRollNo())).append("</roll-no>\n");
            xml.append("      <name>").append(escapeXml(s.getName())).append("</name>\n");
            xml.append("      <department>").append(escapeXml(s.getDepartment())).append("</department>\n");
            xml.append("      <year>").append(escapeXml(s.getYear())).append("</year>\n");
            xml.append("      <registered-date>").append(s.getCreatedAt() != null ? s.getCreatedAt().toString() : "N/A").append("</registered-date>\n");
            xml.append("    </student>\n");
        }

        xml.append("  </students>\n");
        xml.append("</student-list>");

        if ("html".equalsIgnoreCase(format)) {
            String html = applyXslt(xml.toString(), "/WEB-INF/xslt/student-list.xslt");
            resp.setContentType("text/html");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(html);
        } else {
            resp.setContentType("application/xml");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(xml.toString());
        }
    }

    /**
     * Apply XSLT transformation to XML string
     */
    private String applyXslt(String xml, String xsltPath) throws Exception {
        InputStream xsltStream = getServletContext().getResourceAsStream(xsltPath);
        if (xsltStream == null) {
            throw new IOException("XSLT file not found: " + xsltPath);
        }

        TransformerFactory factory = TransformerFactory.newInstance();
        Transformer transformer = factory.newTransformer(new StreamSource(xsltStream));
        StringWriter writer = new StringWriter();
        transformer.transform(
            new StreamSource(new StringReader(xml)),
            new StreamResult(writer)
        );
        return writer.toString();
    }

    /**
     * Escape special XML characters
     */
    private String escapeXml(String value) {
        if (value == null) return "";
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;");
    }
}
