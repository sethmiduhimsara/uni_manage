package com.example.uni_manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketCommentRequest(
        @NotBlank(message = "Comment message is required")
        @Size(max = 500, message = "Comment must be at most 500 characters")
        String message
) {
}
