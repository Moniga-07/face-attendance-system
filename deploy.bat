@echo off
REM ============================================
REM Multi-Face Classroom Attendance System
REM Build and Deploy Script
REM ============================================

set JAVA_HOME=C:\Program Files\Java\jdk-24
set MAVEN_HOME=C:\tools\apache-maven-3.9.16
set CATALINA_HOME=C:\tools\apache-tomcat-10.1.56
set PATH=%MAVEN_HOME%\bin;%CATALINA_HOME%\bin;%PATH%

echo.
echo ===== Building project =====
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo BUILD FAILED!
    pause
    exit /b 1
)

echo.
echo ===== Deploying to Tomcat =====
if exist "%CATALINA_HOME%\webapps\face-attendance.war" (
    del "%CATALINA_HOME%\webapps\face-attendance.war"
)
if exist "%CATALINA_HOME%\webapps\face-attendance" (
    rmdir /s /q "%CATALINA_HOME%\webapps\face-attendance"
)

copy /y "target\face-attendance.war" "%CATALINA_HOME%\webapps\"

echo.
echo ===== Starting Tomcat =====
call "%CATALINA_HOME%\bin\startup.bat"

echo.
echo ============================================
echo  Application deployed!
echo  Open: http://localhost:9090/face-attendance
echo  Login: admin / admin123
echo ============================================
echo.
pause
