package com.example.uni_manage.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String id;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be at most 120 characters")
    private String fullName;

    @Pattern(regexp = "^[+0-9()\\-\\s]{7,20}$", message = "Contact number is invalid")
    private String contactNumber;

    @Size(max = 120, message = "Department must be at most 120 characters")
    private String department;

    @Size(max = 120, message = "Designation must be at most 120 characters")
    private String designation;

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    private Instant createdAt;
    private Instant updatedAt;
}
