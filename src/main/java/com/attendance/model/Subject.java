package com.attendance.model;

public class Subject {
    private int id;
    private String subjectCode;
    private String name;
    private String department;
    private String year;

    public Subject() {
    }

    public Subject(int id, String subjectCode, String name, String department, String year) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.name = name;
        this.department = department;
        this.year = year;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }
}
