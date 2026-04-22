package com.example.uni_manage.controller;

import com.example.uni_manage.dto.BookingDecisionRequest;
import com.example.uni_manage.dto.BookingRequest;
import com.example.uni_manage.model.Booking;
import com.example.uni_manage.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        Booking booking = bookingService.createBooking(request, getEmail(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Booking>> getMyBookings(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(getEmail(user)));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String userEmail
    ) {
        return ResponseEntity.ok(bookingService.getBookingsForAdmin(status, resourceId, date, userEmail));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request
    ) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request.reason()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request
    ) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request.reason()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        boolean isAdmin = hasRole(user, "ROLE_ADMIN");
        return ResponseEntity.ok(bookingService.cancelBooking(id, getEmail(user), isAdmin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        bookingService.deleteBooking(id, getEmail(user));
        return ResponseEntity.noContent().build();
    }

    private String getEmail(OAuth2User user) {
        return (String) user.getAttributes().get("email");
    }

    private boolean hasRole(OAuth2User user, String role) {
        for (GrantedAuthority authority : user.getAuthorities()) {
            if (authority.getAuthority().equals(role)) {
                return true;
            }
        }
        return false;
    }
}
