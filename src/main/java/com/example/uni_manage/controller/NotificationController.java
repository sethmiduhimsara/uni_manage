package com.example.uni_manage.controller;

import com.example.uni_manage.model.Notification;
import com.example.uni_manage.model.NotificationType;
import com.example.uni_manage.service.NotificationService;
import com.example.uni_manage.exception.ForbiddenOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(getEmail(user), unreadOnly));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(
            @PathVariable String id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, getEmail(user)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Integer> markAllRead(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(notificationService.markAllAsRead(getEmail(user)));
    }

        @PostMapping
        public ResponseEntity<Notification> createNotification(
            @RequestBody NotificationCreateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
        ) {
        NotificationType type = request.type() == null
            ? NotificationType.TICKET_STATUS_CHANGED
            : request.type();
        return ResponseEntity.ok(notificationService.createNotification(
            getEmail(user),
            type,
            request.title(),
            request.message(),
            request.referenceId()
        ));
        }

    @DeleteMapping
    public ResponseEntity<Long> clearAll(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(notificationService.clearAll(getEmail(user)));
    }

    private String getEmail(OAuth2User user) {
        if (user == null) {
            throw new ForbiddenOperationException("Authentication required");
        }
        Object email = user.getAttributes().get("email");
        if (email == null) {
            email = user.getAttributes().get("preferred_username");
        }
        if (email == null) {
            email = user.getName();
        }
        if (email == null) {
            throw new ForbiddenOperationException("Email claim not available");
        }
        return email.toString();
    }

    public record NotificationCreateRequest(
            NotificationType type,
            String title,
            String message,
            String referenceId
    ) {
    }
}
