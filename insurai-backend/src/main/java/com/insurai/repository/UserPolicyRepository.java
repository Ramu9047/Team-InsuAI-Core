package com.insurai.repository;

import com.insurai.model.UserPolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserPolicyRepository extends JpaRepository<UserPolicy, Long> {
    List<UserPolicy> findByUserId(Long userId);

    Page<UserPolicy> findByUserId(Long userId, Pageable pageable);

    List<UserPolicy> findByStatus(String status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);
}
