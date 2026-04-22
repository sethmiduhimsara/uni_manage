//TicketCreateRequest.java
package com.example.uni_manage.dto;

import com.example.uni_manage.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
        String resourceId,
        String location,
        @NotBlank(message = "Category is required")
        String category,
        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,
        @NotNull(message = "Priority is required")
        TicketPriority priority,
        @NotBlank(message = "Contact details are required")
        String contactDetails
) {
}
