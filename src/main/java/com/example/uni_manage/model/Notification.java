package com.example.uni_manage.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userEmail;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read;
    private Instant createdAt;
}
