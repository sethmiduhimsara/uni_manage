package com.example.uni_manage.controller;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal OAuth2User user) {
        Set<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        return new AuthUserResponse(
                (String) user.getAttributes().get("name"),
                (String) user.getAttributes().get("email"),
                roles
        );
    }

    public record AuthUserResponse(String name, String email, Set<String> roles) {
    }
}
