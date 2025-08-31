package com.ipchecker.controller;

import com.ipchecker.service.IPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IPController {
    
    @Autowired
    private IPService ipService;
    
    @PostMapping("/check-ip")
    public ResponseEntity<Map<String, Object>> checkIP(@RequestBody Map<String, String> request) {
        try {
            String ipAddress = request.get("ip");
            
            if (ipAddress == null || ipAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("IP address is required"));
            }
            
            Map<String, Object> result = ipService.checkIP(ipAddress.trim());
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    // Add this method inside your IPController class, after the existing methods
    @GetMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> manualCleanup() {
        try {
            Map<String, Object> result = ipService.performManualCleanup();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Cleanup failed: " + e.getMessage()));
        }
    }
        
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "IP Checker API");
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", true);
        error.put("message", message);
        return error;
    }
}