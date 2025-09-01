<?php
require_once 'config.php';

setHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

try {
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in request body');
    }
    
    if (!isset($input['ip']) || empty(trim($input['ip']))) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'IP address is required']);
        exit;
    }
    
    $ip = trim($input['ip']);
    
    // Validate IP format
    if (!validateIP($ip)) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid IP address format']);
        exit;
    }
    
    // Connect to database
    $pdo = getDBConnection();
    createTableIfNotExists($pdo);
    
    // Check if IP already exists
    $stmt = $pdo->prepare("SELECT id, created_at FROM ip_logs WHERE ip = ?");
    $stmt->execute([$ip]);
    $existingIP = $stmt->fetch();
    
    if ($existingIP) {
        echo json_encode([
            'duplicate' => true,
            'message' => 'IP address already checked',
            'first_checked' => $existingIP['created_at']
        ]);
        exit;
    }
    
    // Fetch IP details from external API
    $apiUrl = IP_API_URL . $ip;
    $context = stream_context_create([
        'http' => [
            'timeout' => API_TIMEOUT,
            'user_agent' => 'IPChecker/1.0',
            'method' => 'GET'
        ]
    ]);
    
    $apiResponse = @file_get_contents($apiUrl, false, $context);
    
    if ($apiResponse === false) {
        throw new Exception('Failed to fetch IP details from external service');
    }
    
    $ipData = json_decode($apiResponse, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid response from IP service');
    }
    
    if (!isset($ipData['status']) || $ipData['status'] !== 'success') {
        $errorMsg = isset($ipData['message']) ? $ipData['message'] : 'Unknown error from IP service';
        throw new Exception('IP service error: ' . $errorMsg);
    }
    
    // Save IP to database
    try {
        $stmt = $pdo->prepare("INSERT INTO ip_logs (ip) VALUES (?)");
        $stmt->execute([$ip]);
    } catch(PDOException $e) {
        // Handle duplicate key error gracefully
        if ($e->getCode() == 23000) {
            echo json_encode([
                'duplicate' => true,
                'message' => 'IP address was just checked by another request'
            ]);
            exit;
        } else {
            error_log("Database insert failed: " . $e->getMessage());
            // Continue without throwing error
        }
    }
    
    // Prepare response
    $response = [
        'duplicate' => false,
        'ip' => $ipData['query'],
        'country' => $ipData['country'] ?? 'Unknown',
        'countryCode' => $ipData['countryCode'] ?? 'Unknown',
        'region' => $ipData['region'] ?? 'Unknown',
        'regionName' => $ipData['regionName'] ?? 'Unknown',
        'city' => $ipData['city'] ?? 'Unknown',
        'zip' => $ipData['zip'] ?? 'Unknown',
        'lat' => $ipData['lat'] ?? 0,
        'lon' => $ipData['lon'] ?? 0,
        'timezone' => $ipData['timezone'] ?? 'Unknown',
        'isp' => $ipData['isp'] ?? 'Unknown',
        'org' => $ipData['org'] ?? 'Unknown',
        'as' => $ipData['as'] ?? 'Unknown'
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true, 
        'message' => $e->getMessage()
    ]);
    error_log("IP Checker Error: " . $e->getMessage());
}
?>