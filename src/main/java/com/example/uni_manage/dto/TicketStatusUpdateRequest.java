package com.example.uni_manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketStatusUpdateRequest(
        @NotBlank(message = "Status is required")
        String status,
        @Size(max = 500, message = "Resolution notes must be at most 500 characters")
        String resolutionNotes,
        @Size(max = 200, message = "Reason must be at most 200 characters")
        String reason
) {
}
