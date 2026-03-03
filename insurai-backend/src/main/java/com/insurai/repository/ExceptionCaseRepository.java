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

        @org.springframework.data.jpa.repository.Query("SELECT ec FROM ExceptionCase ec WHERE " +
                        "(ec.agent IS NOT NULL AND ec.agent.company.id = :companyId) OR " +
                        "(ec.policy IS NOT NULL AND ec.policy.company.id = :companyId) OR " +
                        "(ec.booking IS NOT NULL AND ec.booking.agent IS NOT NULL AND ec.booking.agent.company.id = :companyId) OR "
                        +
                        "(ec.user IS NOT NULL AND ec.user.company.id = :companyId)")
        List<ExceptionCase> findByCompanyId(
                        @org.springframework.data.repository.query.Param("companyId") Long companyId);

        @org.springframework.data.jpa.repository.Query("SELECT ec FROM ExceptionCase ec WHERE ec.status = :status AND "
                        +
                        "((ec.agent IS NOT NULL AND ec.agent.company.id = :companyId) OR " +
                        "(ec.policy IS NOT NULL AND ec.policy.company.id = :companyId) OR " +
                        "(ec.booking IS NOT NULL AND ec.booking.agent IS NOT NULL AND ec.booking.agent.company.id = :companyId) OR "
                        +
                        "(ec.user IS NOT NULL AND ec.user.company.id = :companyId))")
        List<ExceptionCase> findByStatusAndCompanyId(
                        @org.springframework.data.repository.query.Param("status") String status,
                        @org.springframework.data.repository.query.Param("companyId") Long companyId);

        @org.springframework.data.jpa.repository.Query("SELECT ec FROM ExceptionCase ec WHERE ec.caseType = :caseType AND "
                        +
                        "((ec.agent IS NOT NULL AND ec.agent.company.id = :companyId) OR " +
                        "(ec.policy IS NOT NULL AND ec.policy.company.id = :companyId) OR " +
                        "(ec.booking IS NOT NULL AND ec.booking.agent IS NOT NULL AND ec.booking.agent.company.id = :companyId) OR "
                        +
                        "(ec.user IS NOT NULL AND ec.user.company.id = :companyId))")
        List<ExceptionCase> findByCaseTypeAndCompanyId(
                        @org.springframework.data.repository.query.Param("caseType") String caseType,
                        @org.springframework.data.repository.query.Param("companyId") Long companyId);
}
