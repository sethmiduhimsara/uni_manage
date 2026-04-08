package com.example.uni_manage.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String resourceId;
    private String location;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String assignedToEmail;
    private String resolutionNotes;
    private String createdByEmail;
    private Instant createdAt;
    private Instant updatedAt;

    private List<TicketComment> comments = new ArrayList<>();
    private List<TicketAttachment> attachments = new ArrayList<>();
}
