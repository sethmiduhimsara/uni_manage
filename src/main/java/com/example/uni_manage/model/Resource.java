package com.example.uni_manage.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private String type;        // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private String location;
    private int capacity;
    private String status;      // ACTIVE, OUT_OF_SERVICE
    private List<String> availabilityWindows;  // e.g. ["MON 8AM-5PM", "TUE 8AM-5PM"]
    private String description;
}
