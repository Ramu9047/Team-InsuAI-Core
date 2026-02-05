package com.insurai.repository;

import com.insurai.model.SmartReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SmartReminderRepository extends JpaRepository<SmartReminder, Long> {

    List<SmartReminder> findByUserIdAndSentFalse(Long userId);

    List<SmartReminder> findByUserIdOrderByReminderTimeDesc(Long userId);

    List<SmartReminder> findBySentFalseAndReminderTimeBefore(LocalDateTime time);

    List<SmartReminder> findByBookingId(Long bookingId);

    List<SmartReminder> findByPolicyId(Long policyId);

    List<SmartReminder> findByClaimId(Long claimId);
}
