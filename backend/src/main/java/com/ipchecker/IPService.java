package com.ipchecker.service;

import com.ipchecker.model.IPLog;
import com.ipchecker.repository.IPRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class IPService {
    
    private static final Logger logger = LoggerFactory.getLogger(IPService.class);
    private static final String IP_API_URL = "http://ip-api.com/json/";
    private static final Pattern IP_PATTERN = Pattern.compile(
        "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    );
    
    @Autowired
    private IPRepository ipRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // NEW: Automatic cleanup every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldIPs() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(10);
            
            // Count before deletion for logging
            long oldIPCount = ipRepository.countOldIPs(cutoffDate);
            
            if (oldIPCount > 0) {
                logger.info("Starting cleanup: Found {} IPs older than 10 days", oldIPCount);
                
                // Delete old IPs
                ipRepository.deleteOldIPs(cutoffDate);
                
                logger.info("✅ Cleanup completed: Deleted {} old IP records", oldIPCount);
            } else {
                logger.info("ℹ️ No cleanup needed: No IPs older than 10 days found");
            }
            
        } catch (Exception e) {
            logger.error("❌ Cleanup failed: {}", e.getMessage(), e);
            // Don't throw exception - let app continue running
        }
    }
    
    // NEW: Manual cleanup method
    public Map<String, Object> performManualCleanup() {
        Map<String, Object> result = new HashMap<>();
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(10);
            long oldIPCount = ipRepository.countOldIPs(cutoffDate);
            
            ipRepository.deleteOldIPs(cutoffDate);
            
            result.put("success", true);
            result.put("deletedCount", oldIPCount);
            result.put("message", "Manual cleanup completed successfully");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    // Your existing checkIP method (KEEP THIS UNCHANGED)
    public Map<String, Object> checkIP(String ipAddress) throws Exception {
        // Validate IP format
        if (!isValidIP(ipAddress)) {
            throw new IllegalArgumentException("Invalid IP address format");
        }
        
        // Check if IP exists in database
        if (ipRepository.existsByIp(ipAddress)) {
            Map<String, Object> response = new HashMap<>();
            response.put("duplicate", true);
            return response;
        }
        
        // Fetch IP details from external API
        try {
            String apiUrl = IP_API_URL + ipAddress;
            String apiResponse = restTemplate.getForObject(apiUrl, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(apiResponse);
            
            // Check if API returned success
            if (!"success".equals(jsonNode.get("status").asText())) {
                throw new Exception("API returned error: " + jsonNode.get("message").asText());
            }
            
            // Save IP to database
            IPLog ipLog = new IPLog(ipAddress);
            ipRepository.save(ipLog);
            
            // Convert JsonNode to Map for response
            Map<String, Object> responseMap = objectMapper.convertValue(jsonNode, Map.class);
            responseMap.put("duplicate", false);
            
            return responseMap;
            
        } catch (Exception e) {
            throw new Exception("Failed to fetch IP details: " + e.getMessage());
        }
    }
    
    private boolean isValidIP(String ip) {
        return ip != null && IP_PATTERN.matcher(ip).matches();
    }
}