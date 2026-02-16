package com.insurai.service;

import com.insurai.model.Notification;
import com.insurai.model.User;
import com.insurai.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    public void createNotification(User recipient, String message, String type) {
        Notification n = new Notification(recipient, message, type);
        notificationRepo.save(n);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForCompany(Long companyId) {
        return notificationRepo.findByCompanyIdAndIsReadFalseOrderByCreatedAtDesc(companyId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepo.findById(java.util.Objects.requireNonNull(notificationId)).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }
}
