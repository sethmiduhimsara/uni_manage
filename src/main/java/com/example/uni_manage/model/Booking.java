package com.example.uni_manage.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @NotBlank(message = "Resource id is required")
    private String resourceId;
    private String resourceName;

    @NotNull(message = "Booking date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String userEmail;
    private String adminDecisionReason;
    private Instant createdAt;
    private Instant updatedAt;
}
