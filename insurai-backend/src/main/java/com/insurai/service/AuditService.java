package com.insurai.service;

import org.springframework.stereotype.Service;

import com.insurai.model.AuditLog;
import com.insurai.repository.AuditLogRepository;

@Service
public class AuditService {
  private final AuditLogRepository repo;
  public AuditService(AuditLogRepository repo){this.repo=repo;}
  public void log(String action, Long userId){
    AuditLog l=new AuditLog();
    l.setAction(action);
    l.setUserId(userId);
    repo.save(l);
  }
}
