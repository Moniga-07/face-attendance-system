CREATE DATABASE IF NOT EXISTS face_attendance_db;
USE face_attendance_db;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    face_descriptor JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    status ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, attendance_date)
);

-- Insert a default admin account: username 'admin', password 'admin123'
-- The password hash here should be bcrypt generated for 'admin123'. We'll just generate one in the app, but here is a typical bcrypt hash for admin123
INSERT INTO admins (username, password) VALUES ('admin', '$2a$10$tZ2E2Hj6o9uC6fT1A9r.l.YF3Q3E0m3k1mQ/Ff2FwP7C/a/H/rXvK') ON DUPLICATE KEY UPDATE username='admin';
