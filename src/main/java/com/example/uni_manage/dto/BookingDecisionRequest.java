package com.example.uni_manage.dto;

import jakarta.validation.constraints.Size;

public record BookingDecisionRequest(
        @Size(max = 10, message = "Reason must be at most 10 characters")
        String reason
) {
}
