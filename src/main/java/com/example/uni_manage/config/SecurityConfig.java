package com.example.uni_manage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.HashSet;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AppSecurityProperties securityProperties;

    public SecurityConfig(AppSecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/login**", "/oauth2/**").permitAll()
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings/me").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/*/cancel").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/*/reject").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/tickets").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/tickets/me").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/tickets/*").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/comments").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/comments/*").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/*/comments/*").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/assign").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/tickets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/notifications/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/notifications/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/resources/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/resources/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService())
                    .oidcUserService(oidcUserService())
                )
                .defaultSuccessUrl("http://localhost:5173", true)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.sendError(401, "Unauthorized");
                    } else {
                        response.sendRedirect("/oauth2/authorization/google");
                    }
                })
            )
            .logout(logout -> logout.logoutSuccessHandler((request, response, authentication) -> {
                response.setStatus(200);
            }));
        return http.build();
    }

    @Bean
    public OAuth2UserService<org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        return userRequest -> {
            OAuth2User user = delegate.loadUser(userRequest);
            String email = (String) user.getAttributes().get("email");
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            if (email != null && securityProperties.adminEmails().contains(email)) {
                roles.add("ROLE_ADMIN");
            }
            return new DefaultOAuth2User(
                    roles.stream().map(org.springframework.security.core.authority.SimpleGrantedAuthority::new).toList(),
                    user.getAttributes(),
                    "email"
            );
        };
    }

    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService delegate = new OidcUserService();
        return userRequest -> {
            OidcUser user = delegate.loadUser(userRequest);
            String email = user.getEmail();
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            if (email != null && securityProperties.adminEmails().contains(email)) {
                roles.add("ROLE_ADMIN");
            }
            return new DefaultOidcUser(
                    roles.stream().map(org.springframework.security.core.authority.SimpleGrantedAuthority::new).toList(),
                    user.getIdToken(),
                    user.getUserInfo(),
                    "email"
            );
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(securityProperties.allowedOrigins());
        config.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(java.util.List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
