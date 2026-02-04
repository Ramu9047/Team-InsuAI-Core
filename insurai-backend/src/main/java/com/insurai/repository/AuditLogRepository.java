package com.insurai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurai.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog,Long> {}