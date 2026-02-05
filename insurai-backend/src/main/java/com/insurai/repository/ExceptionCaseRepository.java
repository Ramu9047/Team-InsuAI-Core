package com.insurai.repository;

import com.insurai.model.ExceptionCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExceptionCaseRepository extends JpaRepository<ExceptionCase, Long> {

    List<ExceptionCase> findByStatus(String status);

    List<ExceptionCase> findByCaseType(String caseType);

    List<ExceptionCase> findByAgentId(Long agentId);

    List<ExceptionCase> findByUserId(Long userId);

    List<ExceptionCase> findByStatusAndCaseType(String status, String caseType);

    List<ExceptionCase> findByIsUrgentTrue();

    List<ExceptionCase> findByRequiresLegalReviewTrue();

    List<ExceptionCase> findByRequiresComplianceReviewTrue();

    Long countByStatus(String status);

    Long countByCaseType(String caseType);

    Long countByAgentId(Long agentId);
}
