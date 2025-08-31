package com.ipchecker.repository;

import com.ipchecker.model.IPLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface IPRepository extends JpaRepository<IPLog, Long> {
    boolean existsByIp(String ip);
    IPLog findByIp(String ip);
    
    // NEW: Method to delete old IPs (10+ days old)
    @Modifying
    @Transactional
    @Query("DELETE FROM IPLog i WHERE i.createdAt < :cutoffTime")
    void deleteOldIPs(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // NEW: Count old IPs before deletion (for logging)
    @Query("SELECT COUNT(i) FROM IPLog i WHERE i.createdAt < :cutoffTime")
    long countOldIPs(@Param("cutoffTime") LocalDateTime cutoffTime);
}