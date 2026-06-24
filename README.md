# Multi-Face Classroom Attendance System

## 🎯 What Is This?
A **Multi-Face Classroom Attendance System** built with Java Servlets, JSP, XML/XSLT, and SOAP Web Services. Instead of scanning faces one-by-one (like fingerprint biometric), this system uses AI to recognize **ALL faces in the camera frame simultaneously** — making it significantly faster.

### Why Better Than Fingerprint?
| Factor | Fingerprint | Our System |
|---|---|---|
| Speed | 60 students × 3s = **3 min** | All at once = **5-10 sec** |
| Contact | Physical touch | **Contactless** |
| Hardware | Dedicated scanner | Any webcam |
| Queue | Students line up | **No queue** |

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), JSP
- **Backend**: Java Servlets (MVC Pattern), JDBC
- **Database**: MySQL
- **AI**: face-api.js (TensorFlow.js)
- **Reports**: XML + XSLT Transformation
- **Web Service**: SOAP/WSDL
- **Server**: Apache Tomcat 10.1

## 📋 Prerequisites
- JDK 17+ (JDK 24 recommended)
- Apache Maven 3.9+
- Apache Tomcat 10.1+
- MySQL 8.0+

## 🚀 Quick Start

### 1. Database Setup
```sql
mysql -u root -p < database/schema.sql
```

### 2. Configure Database
Edit `src/main/webapp/WEB-INF/web.xml` and update the context parameters:
```xml
<context-param>
    <param-name>dbUrl</param-name>
    <param-value>jdbc:mysql://localhost:3306/face_attendance_db</param-value>
</context-param>
<context-param>
    <param-name>dbUser</param-name>
    <param-value>root</param-value>
</context-param>
<context-param>
    <param-name>dbPassword</param-name>
    <param-value>YOUR_PASSWORD</param-value>
</context-param>
```

### 3. Build & Deploy
```bash
# Using the deploy script (Windows)
deploy.bat

# Or manually:
mvn clean package -DskipTests
copy target/face-attendance.war TOMCAT_HOME/webapps/
# Start Tomcat
```

### 4. Access
- **App**: http://localhost:8080/face-attendance
- **Login**: admin / admin123
- **WSDL**: http://localhost:8080/face-attendance/ws/attendance?wsdl

## 📚 Course Topic Coverage

| Topic | Implementation |
|---|---|
| HTML/XHTML | All JSP pages generate semantic HTML5 |
| CSS | `css/style.css` — premium dark theme |
| JavaScript + DOM | `js/dom-utils.js`, `js/face-detection.js`, `js/attendance.js` |
| Java Servlets | `AuthServlet`, `StudentServlet`, `AttendanceServlet`, `DashboardServlet`, `ReportServlet` |
| JSP | `login.jsp`, `dashboard.jsp`, `students.jsp`, `register-student.jsp`, `live-attendance.jsp`, `reports.jsp` |
| XML | Attendance data as XML, schema validation |
| XSLT | `attendance-report.xslt`, `student-list.xslt` |
| XML Schema | `attendance-schema.xsd` |
| SOAP/WSDL | `AttendanceWebServiceServlet` with WSDL generation |
| MVC | Servlets (Controller) → DAO (Model) → JSP (View) |
| Filters | `AuthFilter` (JWT), `CORSFilter` |

## 📁 Project Structure
```
src/main/
├── java/com/attendance/
│   ├── servlet/       # Java Servlets (Controllers)
│   ├── model/         # POJOs (Student, Attendance, Admin)
│   ├── dao/           # Data Access Objects (JDBC)
│   ├── filter/        # Auth & CORS Filters
│   ├── listener/      # App Context Listener
│   ├── util/          # DB Connection, JWT Utils
│   └── ws/            # SOAP Web Service
└── webapp/
    ├── WEB-INF/
    │   ├── web.xml    # Deployment Descriptor
    │   └── xslt/      # XSLT Stylesheets
    ├── css/           # Premium CSS Theme
    ├── js/            # Client-side JavaScript
    ├── jsp/           # JSP Views
    ├── models/        # face-api.js AI Models
    └── xml/           # XML Schema
```
