package com.insurai.repository;

import com.insurai.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Find unread notifications for a user, ordered by newest first
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Find all notifications for a user (optional history)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
