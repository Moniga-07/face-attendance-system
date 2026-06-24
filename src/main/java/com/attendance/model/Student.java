package com.attendance.model;

import java.sql.Timestamp;

/**
 * Student model class - maps to the 'students' table.
 */
public class Student {
    private int id;
    private String rollNo;
    private String name;
    private String department;
    private String year;
    private String faceDescriptor; // JSON string of face descriptor array
    private Timestamp createdAt;

    public Student() {}

    public Student(String rollNo, String name, String department, String year, String faceDescriptor) {
        this.rollNo = rollNo;
        this.name = name;
        this.department = department;
        this.year = year;
        this.faceDescriptor = faceDescriptor;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getFaceDescriptor() { return faceDescriptor; }
    public void setFaceDescriptor(String faceDescriptor) { this.faceDescriptor = faceDescriptor; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
