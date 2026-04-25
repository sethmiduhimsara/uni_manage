package com.example.uni_manage.controller;

import com.example.uni_manage.exception.ForbiddenOperationException;
import com.example.uni_manage.model.UserProfile;
import com.example.uni_manage.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<UserProfile> getProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        String email = getEmail(user);
        String name = getName(user);
        return ResponseEntity.ok(userProfileService.getOrCreate(email, name));
    }

    @PutMapping
    public ResponseEntity<UserProfile> updateProfile(
            @Valid @RequestBody UserProfileService.UserProfileUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        String email = getEmail(user);
        String name = getName(user);
        return ResponseEntity.ok(userProfileService.updateProfile(email, request, name));
    }

    private String getEmail(OAuth2User user) {
        if (user == null) {
            throw new ForbiddenOperationException("Authentication required");
        }
        Object email = user.getAttributes().get("email");
        if (email == null) {
            email = user.getAttributes().get("preferred_username");
        }
        if (email == null) {
            email = user.getName();
        }
        if (email == null) {
            throw new ForbiddenOperationException("Email claim not available");
        }
        return email.toString();
    }

    private String getName(OAuth2User user) {
        if (user == null) {
            return null;
        }
        Object name = user.getAttributes().get("name");
        if (name == null) {
            name = user.getAttributes().get("given_name");
        }
        return name != null ? name.toString() : null;
    }
}
