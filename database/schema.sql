-- Create database
CREATE DATABASE IF NOT EXISTS ip_checker_db;
USE ip_checker_db;

-- Create ip_logs table
CREATE TABLE ip_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(45) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster IP lookups
CREATE INDEX idx_ip ON ip_logs(ip);

-- Sample data (optional)
-- INSERT INTO ip_logs (ip) VALUES ('8.8.8.8');
-- INSERT INTO ip_logs (ip) VALUES ('1.1.1.1');