package com.example.uni_manage.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketAssignRequest(
        @NotBlank(message = "Technician email is required")
        String technicianEmail
) {
}
