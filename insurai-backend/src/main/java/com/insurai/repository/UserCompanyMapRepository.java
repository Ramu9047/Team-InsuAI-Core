package com.insurai.repository;

import com.insurai.model.UserCompanyMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserCompanyMapRepository extends JpaRepository<UserCompanyMap, Long> {

    @Query("SELECT ucm FROM UserCompanyMap ucm WHERE ucm.user.id = :userId AND ucm.company.id = :companyId")
    Optional<UserCompanyMap> findByUserAndCompany(@Param("userId") Long userId, @Param("companyId") Long companyId);

    @Query("SELECT COUNT(ucm) FROM UserCompanyMap ucm WHERE ucm.company.id = :companyId AND ucm.status = 'ACTIVE'")
    long countActiveUsersByCompany(@Param("companyId") Long companyId);

    List<UserCompanyMap> findByCompanyId(Long companyId);

    // Find active mappings for a user
    List<UserCompanyMap> findByUserIdAndStatus(Long userId, String status);
}
