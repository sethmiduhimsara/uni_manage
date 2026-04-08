package com.example.uni_manage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotBlank(message = "Resource id is required")
        String resourceId,
        @NotNull(message = "Booking date is required")
        LocalDate date,
        @NotNull(message = "Start time is required")
        LocalTime startTime,
        @NotNull(message = "End time is required")
        LocalTime endTime,
        @NotBlank(message = "Purpose is required")
        String purpose,
        @Min(value = 1, message = "Expected attendees must be at least 1")
        Integer expectedAttendees
) {
}
