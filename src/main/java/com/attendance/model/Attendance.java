package com.attendance.model;

import java.sql.Date;
import java.sql.Time;

/**
 * Attendance model class - maps to the 'attendance' table.
 */
public class Attendance {
    private int id;
    private int studentId;
    private Date attendanceDate;
    private Time attendanceTime;
    private String status; // Present, Absent, Late

    // Joined fields from student table (for reports)
    private String studentName;
    private String rollNo;
    private String department;
    private String year;

    public Attendance() {}

    public Attendance(int studentId, Date attendanceDate, Time attendanceTime, String status) {
        this.studentId = studentId;
        this.attendanceDate = attendanceDate;
        this.attendanceTime = attendanceTime;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public Date getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(Date attendanceDate) { this.attendanceDate = attendanceDate; }

    public Time getAttendanceTime() { return attendanceTime; }
    public void setAttendanceTime(Time attendanceTime) { this.attendanceTime = attendanceTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
}
