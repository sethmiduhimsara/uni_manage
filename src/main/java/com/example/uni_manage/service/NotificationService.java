package com.example.uni_manage.service;

import com.example.uni_manage.exception.ForbiddenOperationException;
import com.example.uni_manage.exception.NotificationNotFoundException;
import com.example.uni_manage.model.Notification;
import com.example.uni_manage.model.NotificationType;
import com.example.uni_manage.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
            String userEmail,
            NotificationType type,
            String title,
            String message,
            String referenceId
    ) {
        Notification notification = new Notification();
        notification.setUserEmail(userEmail);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
    }

    public void notifyAdmins(
            List<String> adminEmails,
            NotificationType type,
            String title,
            String message,
            String referenceId
    ) {
        if (adminEmails == null || adminEmails.isEmpty()) {
            return;
        }
        for (String adminEmail : adminEmails) {
            createNotification(adminEmail, type, title, message, referenceId);
        }
    }

    public List<Notification> getNotificationsForUser(String userEmail, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByUserEmailAndReadFalseOrderByCreatedAtDesc(userEmail);
        }
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public Notification markAsRead(String id, String userEmail) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + id));
        if (!notification.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new ForbiddenOperationException("You are not allowed to modify this notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(String userEmail) {
        List<Notification> notifications = notificationRepository.findByUserEmailAndReadFalseOrderByCreatedAtDesc(userEmail);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        return notifications.size();
    }

    public long clearAll(String userEmail) {
        return notificationRepository.deleteByUserEmail(userEmail);
    }
}
