package com.insurai.repository;

import com.insurai.model.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUserId(Long userId);

    Page<Claim> findByUserId(Long userId, Pageable pageable);

    List<Claim> findByStatus(String status);

    Page<Claim> findByStatus(String status, Pageable pageable);

    List<Claim> findByPolicyNameIn(List<String> policyNames);
}
