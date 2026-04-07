package com.example.uni_manage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.security")
public record AppSecurityProperties(
        List<String> adminEmails,
        List<String> allowedOrigins
) {
}
