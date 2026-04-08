package com.example.uni_manage.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

        @NotBlank(message = "Name is required")
    private String name;

        @NotBlank(message = "Type is required")
        @Pattern(
                regexp = "(?i)LECTURE_HALL|LAB|MEETING_ROOM|EQUIPMENT",
            message = "Type must be LECTURE_HALL, LAB, MEETING_ROOM, or EQUIPMENT"
        )
        private String type;        // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

        @NotBlank(message = "Location is required")
    private String location;

        @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

        @Pattern(
                regexp = "(?i)ACTIVE|OUT_OF_SERVICE",
            message = "Status must be ACTIVE or OUT_OF_SERVICE"
        )
        private String status;      // ACTIVE, OUT_OF_SERVICE

        @NotEmpty(message = "Availability windows are required")
        private List<@NotBlank(message = "Availability window cannot be blank") String> availabilityWindows;  // e.g. ["MON 8AM-5PM", "TUE 8AM-5PM"]

        @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;
}
