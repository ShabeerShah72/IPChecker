<?php
require_once 'config.php';

setHeaders();

try {
    // Test database connection
    $pdo = getDBConnection();
    
    // Get some stats
    $stmt = $pdo->query("SELECT COUNT(*) as total_ips FROM ip_logs");
    $stats = $stmt->fetch();
    
    $response = [
        'status' => 'OK',
        'service' => 'IP Checker PHP API',
        'timestamp' => date('Y-m-d H:i:s'),
        'database' => 'Connected',
        'total_ips_checked' => (int)$stats['total_ips']
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'ERROR',
        'service' => 'IP Checker PHP API',
        'timestamp' => date('Y-m-d H:i:s'),
        'error' => $e->getMessage()
    ]);
}
?>
