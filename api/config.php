<?php
// Database configuration - UPDATE THESE WITH YOUR HOSTINGER DETAILS
define('DB_HOST', 'localIPhost');
define('DB_NAME', 'ghost_IP_Checker_DB');     // Replace with your actual database name
define('DB_USER', 'ghost');     // Replace with your actual username
define('DB_PASS', 'ghostdeveloper05'); // Replace with your actual password

// API configuration
define('IP_API_URL', 'http://ip-api.com/json/');
define('API_TIMEOUT', 10);

// Create database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", 
            DB_USER, 
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}

// Create table if not exists
function createTableIfNotExists($pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS ip_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ip (ip),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8");
    } catch(PDOException $e) {
        // Table might already exist, continue
        error_log("Table creation warning: " . $e->getMessage());
    }
}

// Validate IP address
function validateIP($ip) {
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
}

// Set common headers
function setHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Content-Type: application/json; charset=utf-8');
}
?>