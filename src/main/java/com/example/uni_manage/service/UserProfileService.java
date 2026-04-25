package com.example.uni_manage.service;

import com.example.uni_manage.model.UserProfile;
import com.example.uni_manage.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfile getOrCreate(String email, String fallbackName) {
        return userProfileRepository.findByEmail(email)
                .orElseGet(() -> {
                    UserProfile profile = new UserProfile();
                    profile.setEmail(email);
                    profile.setFullName(fallbackName != null ? fallbackName : email);
                    profile.setCreatedAt(Instant.now());
                    profile.setUpdatedAt(Instant.now());
                    return userProfileRepository.save(profile);
                });
    }

    public UserProfile updateProfile(String email, UserProfileUpdateRequest request, String fallbackName) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseGet(() -> {
                    UserProfile created = new UserProfile();
                    created.setEmail(email);
                    created.setFullName(fallbackName != null ? fallbackName : email);
                    created.setCreatedAt(Instant.now());
                    return created;
                });

        profile.setFullName(request.fullName());
        profile.setContactNumber(request.contactNumber());
        profile.setDepartment(request.department());
        profile.setDesignation(request.designation());
        profile.setBio(request.bio());
        profile.setUpdatedAt(Instant.now());
        return userProfileRepository.save(profile);
    }

    public record UserProfileUpdateRequest(
            String fullName,
            String contactNumber,
            String department,
            String designation,
            String bio
    ) {
    }
}
