package com.example.uni_manage.controller;

import com.example.uni_manage.model.Notification;
import com.example.uni_manage.service.NotificationService;
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

    private String getEmail(OAuth2User user) {
        return (String) user.getAttributes().get("email");
    }
}
