package com.insurai.repository;

import com.insurai.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    java.util.List<Policy> findByStatusAndCompany_Status(String status, String companyStatus);

    java.util.List<Policy> findByCompanyId(Long companyId);
}
