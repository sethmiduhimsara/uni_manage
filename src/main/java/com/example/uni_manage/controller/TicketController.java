package com.example.uni_manage.controller;

import com.example.uni_manage.dto.TicketAssignRequest;
import com.example.uni_manage.dto.TicketCommentRequest;
import com.example.uni_manage.dto.TicketCreateRequest;
import com.example.uni_manage.dto.TicketStatusUpdateRequest;
import com.example.uni_manage.model.Ticket;
import com.example.uni_manage.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestPart("ticket") TicketCreateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        Ticket ticket = ticketService.createTicket(request, files, getEmail(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Ticket>> getMyTickets(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(ticketService.getTicketsForUser(getEmail(user)));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String createdByEmail
    ) {
        return ResponseEntity.ok(ticketService.getTicketsForAdmin(status, priority, resourceId, location, createdByEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(
            @PathVariable String id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        boolean isAdmin = hasRole(user, "ROLE_ADMIN");
        return ResponseEntity.ok(ticketService.getTicketById(id, getEmail(user), isAdmin));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody TicketAssignRequest request
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(
            @PathVariable String id,
            @Valid @RequestBody TicketCommentRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        return ResponseEntity.ok(ticketService.addComment(id, request, getEmail(user)));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody TicketCommentRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        boolean isAdmin = hasRole(user, "ROLE_ADMIN");
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, request, getEmail(user), isAdmin));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User user
    ) {
        boolean isAdmin = hasRole(user, "ROLE_ADMIN");
        return ResponseEntity.ok(ticketService.deleteComment(id, commentId, getEmail(user), isAdmin));
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
