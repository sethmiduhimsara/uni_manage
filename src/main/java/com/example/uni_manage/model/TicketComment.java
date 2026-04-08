package com.example.uni_manage.model;

import lombok.Data;

import java.time.Instant;

@Data
public class TicketComment {
    private String id;
    private String authorEmail;
    private String message;
    private Instant createdAt;
    private Instant updatedAt;
}
