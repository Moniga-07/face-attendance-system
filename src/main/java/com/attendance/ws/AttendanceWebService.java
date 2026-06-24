package com.attendance.ws;

import com.attendance.dao.AttendanceDAO;
import com.attendance.dao.StudentDAO;
import com.attendance.model.Attendance;
import com.attendance.model.Student;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

import java.util.List;

/**
 * SOAP Web Service for Attendance System.
 * Exposes attendance operations via SOAP/WSDL protocol.
 * 
 * WSDL available at: /ws/attendance?wsdl
 * 
 * This demonstrates JAX-WS, WSDL, SOAP, and XML Schema 
 * for data representation and communication (Course Topics 5 & 7).
 */
@WebService(serviceName = "AttendanceService",
            portName = "AttendancePort",
            targetNamespace = "http://ws.attendance.com/")
public class AttendanceWebService {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    /**
     * Get attendance records for a specific date as XML string.
     * @param date Date in YYYY-MM-DD format
     * @return XML string of attendance records
     */
    @WebMethod(operationName = "getAttendanceByDate")
    public String getAttendanceByDate(@WebParam(name = "date") String date) {
        try {
            List<Attendance> records = attendanceDAO.findAll(date, null, null);
            return buildAttendanceXml(records);
        } catch (Exception e) {
            return "<error>" + e.getMessage() + "</error>";
        }
    }

    /**
     * Get attendance records for a date range.
     * @param startDate Start date in YYYY-MM-DD format
     * @param endDate End date in YYYY-MM-DD format
     * @return XML string of attendance records
     */
    @WebMethod(operationName = "getAttendanceByDateRange")
    public String getAttendanceByDateRange(
            @WebParam(name = "startDate") String startDate,
            @WebParam(name = "endDate") String endDate) {
        try {
            List<Attendance> records = attendanceDAO.findAll(null, startDate, endDate);
            return buildAttendanceXml(records);
        } catch (Exception e) {
            return "<error>" + e.getMessage() + "</error>";
        }
    }

    /**
     * Get the full list of registered students.
     * @return XML string of student list
     */
    @WebMethod(operationName = "getStudentList")
    public String getStudentList() {
        try {
            List<Student> students = studentDAO.findAll();
            StringBuilder xml = new StringBuilder();
            xml.append("<student-list>");
            xml.append("<total>").append(students.size()).append("</total>");

            for (Student s : students) {
                xml.append("<student>");
                xml.append("<id>").append(s.getId()).append("</id>");
                xml.append("<roll-no>").append(escapeXml(s.getRollNo())).append("</roll-no>");
                xml.append("<name>").append(escapeXml(s.getName())).append("</name>");
                xml.append("<department>").append(escapeXml(s.getDepartment())).append("</department>");
                xml.append("<year>").append(escapeXml(s.getYear())).append("</year>");
                xml.append("</student>");
            }

            xml.append("</student-list>");
            return xml.toString();
        } catch (Exception e) {
            return "<error>" + e.getMessage() + "</error>";
        }
    }

    /**
     * Mark attendance via SOAP for a student.
     * @param studentId The student ID
     * @param date Date in YYYY-MM-DD format
     * @param time Time in HH:MM:SS format
     * @return Result message
     */
    @WebMethod(operationName = "markAttendance")
    public String markAttendance(
            @WebParam(name = "studentId") int studentId,
            @WebParam(name = "date") String date,
            @WebParam(name = "time") String time) {
        try {
            java.time.LocalTime now = java.time.LocalTime.now();
            int minute = now.getMinute();
            String status = "Present";
            if (minute >= 11 && minute <= 20) {
                status = "Late";
            } else if (minute > 20) {
                status = "Absent";
            }
            attendanceDAO.markAttendance(studentId, date, time, status);
            String name = attendanceDAO.getStudentName(studentId);
            return "<result><status>SUCCESS</status><message>Attendance marked for " +
                   escapeXml(name) + "</message></result>";
        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            return "<result><status>DUPLICATE</status><message>Attendance already marked for today</message></result>";
        } catch (Exception e) {
            return "<result><status>ERROR</status><message>" + e.getMessage() + "</message></result>";
        }
    }

    /**
     * Get today's attendance summary statistics.
     * @return XML with stats
     */
    @WebMethod(operationName = "getTodayStats")
    public String getTodayStats() {
        try {
            int totalStudents = studentDAO.getTotalCount();
            int todayCount = attendanceDAO.getTodayCount();
            double rate = totalStudents > 0 ? Math.round((double) todayCount / totalStudents * 100) : 0;

            return "<stats>" +
                   "<total-students>" + totalStudents + "</total-students>" +
                   "<today-attendance>" + todayCount + "</today-attendance>" +
                   "<attendance-rate>" + rate + "</attendance-rate>" +
                   "</stats>";
        } catch (Exception e) {
            return "<error>" + e.getMessage() + "</error>";
        }
    }

    private String buildAttendanceXml(List<Attendance> records) {
        StringBuilder xml = new StringBuilder();
        xml.append("<attendance-report>");
        xml.append("<total-records>").append(records.size()).append("</total-records>");
        xml.append("<records>");

        for (Attendance a : records) {
            xml.append("<record>");
            xml.append("<roll-no>").append(escapeXml(a.getRollNo())).append("</roll-no>");
            xml.append("<student-name>").append(escapeXml(a.getStudentName())).append("</student-name>");
            xml.append("<department>").append(escapeXml(a.getDepartment())).append("</department>");
            xml.append("<year>").append(escapeXml(a.getYear())).append("</year>");
            xml.append("<date>").append(a.getAttendanceDate()).append("</date>");
            xml.append("<time>").append(a.getAttendanceTime()).append("</time>");
            xml.append("<status>").append(a.getStatus()).append("</status>");
            xml.append("</record>");
        }

        xml.append("</records>");
        xml.append("</attendance-report>");
        return xml.toString();
    }

    private String escapeXml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;")
                    .replace(">", "&gt;").replace("\"", "&quot;");
    }
}
