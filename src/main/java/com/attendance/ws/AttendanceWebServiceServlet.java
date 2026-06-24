package com.attendance.ws;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.attendance.dao.AttendanceDAO;
import com.attendance.dao.StudentDAO;
import com.attendance.model.Attendance;
import com.attendance.model.Student;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

/**
 * SOAP Web Service Servlet - Handles SOAP requests manually.
 * This provides a working SOAP endpoint without requiring full JAX-WS runtime on Tomcat.
 * 
 * GET  /ws/attendance          - Returns WSDL document
 * POST /ws/attendance          - Processes SOAP requests
 */
public class AttendanceWebServiceServlet extends HttpServlet {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // Return WSDL document
        String wsdlParam = req.getParameter("wsdl");
        if (wsdlParam != null || "wsdl".equalsIgnoreCase(req.getQueryString())) {
            resp.setContentType("text/xml");
            resp.setCharacterEncoding("UTF-8");
            
            String serverUrl = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort() + req.getContextPath();
            resp.getWriter().write(generateWsdl(serverUrl));
            return;
        }
        
        resp.setContentType("text/html");
        resp.getWriter().write("<html><body><h2>Attendance SOAP Web Service</h2>" +
            "<p>WSDL: <a href='?wsdl'>?wsdl</a></p>" +
            "<p>Operations: getAttendanceByDate, getStudentList, markAttendance, getTodayStats</p></body></html>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/xml");
        resp.setCharacterEncoding("UTF-8");

        try {
            // Read SOAP request
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            String soapRequest = sb.toString();

            String soapResponse;

            if (soapRequest.contains("getAttendanceByDate")) {
                String date = extractValue(soapRequest, "date");
                soapResponse = handleGetAttendanceByDate(date);
            } else if (soapRequest.contains("getStudentList")) {
                soapResponse = handleGetStudentList();
            } else if (soapRequest.contains("markAttendance")) {
                String studentId = extractValue(soapRequest, "studentId");
                String date = extractValue(soapRequest, "date");
                String time = extractValue(soapRequest, "time");
                soapResponse = handleMarkAttendance(Integer.parseInt(studentId), date, time);
            } else if (soapRequest.contains("getTodayStats")) {
                soapResponse = handleGetTodayStats();
            } else {
                soapResponse = createSoapFault("Unknown operation");
            }

            resp.getWriter().write(soapResponse);

        } catch (Exception e) {
            e.printStackTrace();
            resp.getWriter().write(createSoapFault(e.getMessage()));
        }
    }

    private String handleGetAttendanceByDate(String date) {
        try {
            List<Attendance> records = attendanceDAO.findAll(date, null, null);
            StringBuilder result = new StringBuilder();
            result.append("<attendance-report>");
            result.append("<total-records>").append(records.size()).append("</total-records>");
            for (Attendance a : records) {
                result.append("<record>");
                result.append("<roll-no>").append(esc(a.getRollNo())).append("</roll-no>");
                result.append("<student-name>").append(esc(a.getStudentName())).append("</student-name>");
                result.append("<department>").append(esc(a.getDepartment())).append("</department>");
                result.append("<date>").append(a.getAttendanceDate()).append("</date>");
                result.append("<time>").append(a.getAttendanceTime()).append("</time>");
                result.append("<status>").append(a.getStatus()).append("</status>");
                result.append("</record>");
            }
            result.append("</attendance-report>");
            return wrapSoapResponse("getAttendanceByDateResponse", result.toString());
        } catch (Exception e) {
            return createSoapFault(e.getMessage());
        }
    }

    private String handleGetStudentList() {
        try {
            List<Student> students = studentDAO.findAll();
            StringBuilder result = new StringBuilder();
            result.append("<student-list><total>").append(students.size()).append("</total>");
            for (Student s : students) {
                result.append("<student>");
                result.append("<id>").append(s.getId()).append("</id>");
                result.append("<roll-no>").append(esc(s.getRollNo())).append("</roll-no>");
                result.append("<name>").append(esc(s.getName())).append("</name>");
                result.append("<department>").append(esc(s.getDepartment())).append("</department>");
                result.append("<year>").append(esc(s.getYear())).append("</year>");
                result.append("</student>");
            }
            result.append("</student-list>");
            return wrapSoapResponse("getStudentListResponse", result.toString());
        } catch (Exception e) {
            return createSoapFault(e.getMessage());
        }
    }

    private String handleMarkAttendance(int studentId, String date, String time) {
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
            return wrapSoapResponse("markAttendanceResponse",
                "<status>SUCCESS</status><message>Attendance marked for " + esc(name) + "</message>");
        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            return wrapSoapResponse("markAttendanceResponse",
                "<status>DUPLICATE</status><message>Attendance already marked for today</message>");
        } catch (Exception e) {
            return createSoapFault(e.getMessage());
        }
    }

    private String handleGetTodayStats() {
        try {
            int total = studentDAO.getTotalCount();
            int today = attendanceDAO.getTodayCount();
            double rate = total > 0 ? Math.round((double) today / total * 100) : 0;
            return wrapSoapResponse("getTodayStatsResponse",
                "<total-students>" + total + "</total-students>" +
                "<today-attendance>" + today + "</today-attendance>" +
                "<attendance-rate>" + rate + "</attendance-rate>");
        } catch (Exception e) {
            return createSoapFault(e.getMessage());
        }
    }

    private String extractValue(String xml, String tag) {
        int start = xml.indexOf("<" + tag + ">");
        int end = xml.indexOf("</" + tag + ">");
        if (start >= 0 && end >= 0) {
            return xml.substring(start + tag.length() + 2, end);
        }
        // Try with namespace prefix
        start = xml.indexOf(":" + tag + ">");
        if (start >= 0) {
            start = xml.indexOf(">", start) + 1;
            end = xml.indexOf("<", start);
            if (end >= 0) return xml.substring(start, end);
        }
        return "";
    }

    private String wrapSoapResponse(String operation, String body) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
               "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
               "xmlns:ns=\"http://ws.attendance.com/\">" +
               "<soap:Body>" +
               "<ns:" + operation + ">" +
               "<result>" + body + "</result>" +
               "</ns:" + operation + ">" +
               "</soap:Body>" +
               "</soap:Envelope>";
    }

    private String createSoapFault(String message) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
               "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
               "<soap:Body>" +
               "<soap:Fault>" +
               "<faultcode>soap:Server</faultcode>" +
               "<faultstring>" + esc(message) + "</faultstring>" +
               "</soap:Fault>" +
               "</soap:Body>" +
               "</soap:Envelope>";
    }

    private String generateWsdl(String serverUrl) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<definitions xmlns=\"http://schemas.xmlsoap.org/wsdl/\"\n" +
        "             xmlns:soap=\"http://schemas.xmlsoap.org/wsdl/soap/\"\n" +
        "             xmlns:tns=\"http://ws.attendance.com/\"\n" +
        "             xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n" +
        "             name=\"AttendanceService\"\n" +
        "             targetNamespace=\"http://ws.attendance.com/\">\n\n" +

        "  <!-- Types -->\n" +
        "  <types>\n" +
        "    <xsd:schema targetNamespace=\"http://ws.attendance.com/\">\n" +
        "      <xsd:element name=\"getAttendanceByDate\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"date\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"getAttendanceByDateResponse\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"result\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"getStudentList\">\n" +
        "        <xsd:complexType><xsd:sequence/></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"getStudentListResponse\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"result\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"markAttendance\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"studentId\" type=\"xsd:int\"/>\n" +
        "          <xsd:element name=\"date\" type=\"xsd:string\"/>\n" +
        "          <xsd:element name=\"time\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"markAttendanceResponse\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"result\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"getTodayStats\">\n" +
        "        <xsd:complexType><xsd:sequence/></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "      <xsd:element name=\"getTodayStatsResponse\">\n" +
        "        <xsd:complexType><xsd:sequence>\n" +
        "          <xsd:element name=\"result\" type=\"xsd:string\"/>\n" +
        "        </xsd:sequence></xsd:complexType>\n" +
        "      </xsd:element>\n" +
        "    </xsd:schema>\n" +
        "  </types>\n\n" +

        "  <!-- Messages -->\n" +
        "  <message name=\"getAttendanceByDateInput\"><part name=\"parameters\" element=\"tns:getAttendanceByDate\"/></message>\n" +
        "  <message name=\"getAttendanceByDateOutput\"><part name=\"parameters\" element=\"tns:getAttendanceByDateResponse\"/></message>\n" +
        "  <message name=\"getStudentListInput\"><part name=\"parameters\" element=\"tns:getStudentList\"/></message>\n" +
        "  <message name=\"getStudentListOutput\"><part name=\"parameters\" element=\"tns:getStudentListResponse\"/></message>\n" +
        "  <message name=\"markAttendanceInput\"><part name=\"parameters\" element=\"tns:markAttendance\"/></message>\n" +
        "  <message name=\"markAttendanceOutput\"><part name=\"parameters\" element=\"tns:markAttendanceResponse\"/></message>\n" +
        "  <message name=\"getTodayStatsInput\"><part name=\"parameters\" element=\"tns:getTodayStats\"/></message>\n" +
        "  <message name=\"getTodayStatsOutput\"><part name=\"parameters\" element=\"tns:getTodayStatsResponse\"/></message>\n\n" +

        "  <!-- Port Type -->\n" +
        "  <portType name=\"AttendancePort\">\n" +
        "    <operation name=\"getAttendanceByDate\">\n" +
        "      <input message=\"tns:getAttendanceByDateInput\"/>\n" +
        "      <output message=\"tns:getAttendanceByDateOutput\"/>\n" +
        "    </operation>\n" +
        "    <operation name=\"getStudentList\">\n" +
        "      <input message=\"tns:getStudentListInput\"/>\n" +
        "      <output message=\"tns:getStudentListOutput\"/>\n" +
        "    </operation>\n" +
        "    <operation name=\"markAttendance\">\n" +
        "      <input message=\"tns:markAttendanceInput\"/>\n" +
        "      <output message=\"tns:markAttendanceOutput\"/>\n" +
        "    </operation>\n" +
        "    <operation name=\"getTodayStats\">\n" +
        "      <input message=\"tns:getTodayStatsInput\"/>\n" +
        "      <output message=\"tns:getTodayStatsOutput\"/>\n" +
        "    </operation>\n" +
        "  </portType>\n\n" +

        "  <!-- Binding -->\n" +
        "  <binding name=\"AttendanceBinding\" type=\"tns:AttendancePort\">\n" +
        "    <soap:binding style=\"document\" transport=\"http://schemas.xmlsoap.org/soap/http\"/>\n" +
        "    <operation name=\"getAttendanceByDate\">\n" +
        "      <soap:operation soapAction=\"getAttendanceByDate\"/>\n" +
        "      <input><soap:body use=\"literal\"/></input>\n" +
        "      <output><soap:body use=\"literal\"/></output>\n" +
        "    </operation>\n" +
        "    <operation name=\"getStudentList\">\n" +
        "      <soap:operation soapAction=\"getStudentList\"/>\n" +
        "      <input><soap:body use=\"literal\"/></input>\n" +
        "      <output><soap:body use=\"literal\"/></output>\n" +
        "    </operation>\n" +
        "    <operation name=\"markAttendance\">\n" +
        "      <soap:operation soapAction=\"markAttendance\"/>\n" +
        "      <input><soap:body use=\"literal\"/></input>\n" +
        "      <output><soap:body use=\"literal\"/></output>\n" +
        "    </operation>\n" +
        "    <operation name=\"getTodayStats\">\n" +
        "      <soap:operation soapAction=\"getTodayStats\"/>\n" +
        "      <input><soap:body use=\"literal\"/></input>\n" +
        "      <output><soap:body use=\"literal\"/></output>\n" +
        "    </operation>\n" +
        "  </binding>\n\n" +

        "  <!-- Service -->\n" +
        "  <service name=\"AttendanceService\">\n" +
        "    <port name=\"AttendancePort\" binding=\"tns:AttendanceBinding\">\n" +
        "      <soap:address location=\"" + serverUrl + "/ws/attendance\"/>\n" +
        "    </port>\n" +
        "  </service>\n\n" +
        "</definitions>";
    }

    private String esc(String v) {
        if (v == null) return "";
        return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
