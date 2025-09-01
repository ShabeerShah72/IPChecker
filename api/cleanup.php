<?php
require_once 'config.php';

setHeaders();

// Only allow GET requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Method not allowed. Use GET.']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Count old records first
    $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM ip_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $countStmt->execute();
    $oldCount = $countStmt->fetch()['count'];
    
    if ($oldCount > 0) {
        // Delete records older than 30 days
        $deleteStmt = $pdo->prepare("DELETE FROM ip_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $deleteStmt->execute();
        $deletedCount = $deleteStmt->rowCount();
    } else {
        $deletedCount = 0;
    }
    
    // Get current total
    $totalStmt = $pdo->query("SELECT COUNT(*) as total FROM ip_logs");
    $totalCount = $totalStmt->fetch()['total'];
    
    echo json_encode([
        'success' => true,
        'deletedCount' => (int)$deletedCount,
        'remainingCount' => (int)$totalCount,
        'message' => $deletedCount > 0 
            ? "Cleanup completed: Deleted $deletedCount old records" 
            : "No old records found to delete"
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    error_log("Cleanup Error: " . $e->getMessage());
}
?>