package com.example.uni_manage.model;

import lombok.Data;

import java.time.Instant;

@Data
public class TicketAttachment {
    private String id;
    private String fileName;
    private String contentType;
    private long size;
    private String storagePath;
    private Instant uploadedAt;
}
