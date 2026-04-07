package com.example.uni_manage.service;

import com.example.uni_manage.config.AppStorageProperties;
import com.example.uni_manage.dto.TicketAssignRequest;
import com.example.uni_manage.dto.TicketCommentRequest;
import com.example.uni_manage.dto.TicketCreateRequest;
import com.example.uni_manage.dto.TicketStatusUpdateRequest;
import com.example.uni_manage.exception.BadRequestException;
import com.example.uni_manage.exception.FileStorageException;
import com.example.uni_manage.exception.ForbiddenOperationException;
import com.example.uni_manage.exception.ResourceNotFoundException;
import com.example.uni_manage.exception.TicketNotFoundException;
import com.example.uni_manage.model.Ticket;
import com.example.uni_manage.model.TicketAttachment;
import com.example.uni_manage.model.TicketComment;
import com.example.uni_manage.model.TicketPriority;
import com.example.uni_manage.model.TicketStatus;
import com.example.uni_manage.model.NotificationType;
import com.example.uni_manage.repository.ResourceRepository;
import com.example.uni_manage.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final AppStorageProperties storageProperties;
    private final NotificationService notificationService;

    public Ticket createTicket(TicketCreateRequest request, List<MultipartFile> files, String userEmail) {
        validateLocationOrResource(request);
        if (request.resourceId() != null && !request.resourceId().isBlank()) {
            ensureResourceExists(request.resourceId());
        }

        Ticket ticket = new Ticket();
        ticket.setResourceId(emptyToNull(request.resourceId()));
        ticket.setLocation(emptyToNull(request.location()));
        ticket.setCategory(request.category());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setContactDetails(request.contactDetails());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedByEmail(userEmail);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        Ticket saved = ticketRepository.save(ticket);
        if (files != null && !files.isEmpty()) {
            List<TicketAttachment> attachments = storeAttachments(saved.getId(), files);
            saved.setAttachments(attachments);
            saved.setUpdatedAt(Instant.now());
            saved = ticketRepository.save(saved);
        }
        return saved;
    }

    public List<Ticket> getTicketsForUser(String userEmail) {
        return ticketRepository.findByCreatedByEmail(userEmail);
    }

    public List<Ticket> getTicketsForAdmin(
            String status,
            String priority,
            String resourceId,
            String location,
            String createdByEmail
    ) {
        int filters = countProvided(status, priority, resourceId, location, createdByEmail);
        if (filters == 0) {
            return ticketRepository.findAll();
        }
        if (filters == 1) {
            if (status != null) return ticketRepository.findByStatus(parseStatus(status));
            if (priority != null) return ticketRepository.findByPriority(parsePriority(priority));
            if (resourceId != null) return ticketRepository.findByResourceId(resourceId);
            if (location != null) return ticketRepository.findByLocation(location);
            return ticketRepository.findByCreatedByEmail(createdByEmail);
        }

        Stream<Ticket> stream = ticketRepository.findAll().stream();
        if (status != null) {
            TicketStatus parsedStatus = parseStatus(status);
            stream = stream.filter(ticket -> ticket.getStatus() == parsedStatus);
        }
        if (priority != null) {
            TicketPriority parsedPriority = parsePriority(priority);
            stream = stream.filter(ticket -> ticket.getPriority() == parsedPriority);
        }
        if (resourceId != null) {
            stream = stream.filter(ticket -> ticket.getResourceId() != null
                    && ticket.getResourceId().equals(resourceId));
        }
        if (location != null) {
            String normalizedLocation = location.toLowerCase(Locale.ROOT);
            stream = stream.filter(ticket -> ticket.getLocation() != null
                    && ticket.getLocation().toLowerCase(Locale.ROOT).equals(normalizedLocation));
        }
        if (createdByEmail != null) {
            String normalizedEmail = createdByEmail.toLowerCase(Locale.ROOT);
            stream = stream.filter(ticket -> ticket.getCreatedByEmail() != null
                    && ticket.getCreatedByEmail().toLowerCase(Locale.ROOT).equals(normalizedEmail));
        }
        return stream.toList();
    }

    public Ticket getTicketById(String id, String requesterEmail, boolean isAdmin) {
        Ticket ticket = getTicket(id);
        if (!isAdmin && !ticket.getCreatedByEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenOperationException("You are not allowed to view this ticket");
        }
        return ticket;
    }

    public Ticket assignTechnician(String id, TicketAssignRequest request) {
        Ticket ticket = getTicket(id);
        ticket.setAssignedToEmail(request.technicianEmail());
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    public Ticket updateStatus(String id, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicket(id);
        TicketStatus nextStatus = parseStatus(request.status());

        if (nextStatus == TicketStatus.REJECTED && (request.reason() == null || request.reason().isBlank())) {
            throw new BadRequestException("Rejection reason is required");
        }

        ticket.setStatus(nextStatus);
        if (nextStatus == TicketStatus.REJECTED) {
            ticket.setResolutionNotes(request.reason());
        } else if (request.resolutionNotes() != null) {
            ticket.setResolutionNotes(request.resolutionNotes());
        }
        ticket.setUpdatedAt(Instant.now());
        Ticket saved = ticketRepository.save(ticket);
        if (saved.getCreatedByEmail() != null) {
            notificationService.createNotification(
                    saved.getCreatedByEmail(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket status updated",
                    "Ticket status changed to " + saved.getStatus(),
                    saved.getId()
            );
        }
        return saved;
    }

    public Ticket addComment(String id, TicketCommentRequest request, String authorEmail) {
        Ticket ticket = getTicket(id);
        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setAuthorEmail(authorEmail);
        comment.setMessage(request.message());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());

        List<TicketComment> comments = new ArrayList<>(ticket.getComments());
        comments.add(comment);
        ticket.setComments(comments);
        ticket.setUpdatedAt(Instant.now());
        Ticket saved = ticketRepository.save(ticket);
        if (saved.getCreatedByEmail() != null
            && authorEmail != null
            && !saved.getCreatedByEmail().equalsIgnoreCase(authorEmail)) {
            notificationService.createNotification(
                saved.getCreatedByEmail(),
                NotificationType.TICKET_COMMENT,
                "New comment on ticket",
                "A new comment was added to your ticket.",
                saved.getId()
            );
        }
        return saved;
    }

    public Ticket updateComment(String ticketId, String commentId, TicketCommentRequest request, String requesterEmail, boolean isAdmin) {
        Ticket ticket = getTicket(ticketId);
        TicketComment comment = findComment(ticket, commentId);
        if (!isAdmin && !comment.getAuthorEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenOperationException("You are not allowed to edit this comment");
        }
        comment.setMessage(request.message());
        comment.setUpdatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    public Ticket deleteComment(String ticketId, String commentId, String requesterEmail, boolean isAdmin) {
        Ticket ticket = getTicket(ticketId);
        TicketComment comment = findComment(ticket, commentId);
        if (!isAdmin && !comment.getAuthorEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenOperationException("You are not allowed to delete this comment");
        }
        ticket.getComments().removeIf(item -> item.getId().equals(commentId));
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    private Ticket getTicket(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));
    }

    private void validateLocationOrResource(TicketCreateRequest request) {
        boolean hasResource = request.resourceId() != null && !request.resourceId().isBlank();
        boolean hasLocation = request.location() != null && !request.location().isBlank();
        if (!hasResource && !hasLocation) {
            throw new BadRequestException("Either resourceId or location is required");
        }
    }

    private void ensureResourceExists(String resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found with id: " + resourceId);
        }
    }

    private List<TicketAttachment> storeAttachments(String ticketId, List<MultipartFile> files) {
        if (files.size() > 3) {
            throw new BadRequestException("Maximum 3 attachments are allowed");
        }
        List<TicketAttachment> attachments = new ArrayList<>();
        Path targetDir = Paths.get(resolveTicketUploadPath()).resolve(ticketId);
        try {
            Files.createDirectories(targetDir);
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
                    throw new BadRequestException("Only image files are allowed");
                }
                String extension = getExtension(file.getOriginalFilename());
                String storedName = UUID.randomUUID() + extension;
                Path storedPath = targetDir.resolve(storedName);
                file.transferTo(storedPath);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setId(UUID.randomUUID().toString());
                attachment.setFileName(file.getOriginalFilename());
                attachment.setContentType(file.getContentType());
                attachment.setSize(file.getSize());
                attachment.setStoragePath(storedPath.toString());
                attachment.setUploadedAt(Instant.now());
                attachments.add(attachment);
            }
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store attachments");
        }
        return attachments;
    }

    private String resolveTicketUploadPath() {
        if (storageProperties == null || storageProperties.ticketUploadsPath() == null) {
            return "uploads/tickets";
        }
        return storageProperties.ticketUploadsPath();
    }

    private String getExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int index = fileName.lastIndexOf('.');
        if (index < 0) {
            return "";
        }
        return fileName.substring(index);
    }

    private TicketStatus parseStatus(String status) {
        try {
            return TicketStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Use OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED");
        }
    }

    private TicketPriority parsePriority(String priority) {
        try {
            return TicketPriority.valueOf(priority.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid priority. Use LOW, MEDIUM, or HIGH");
        }
    }

    private int countProvided(String status, String priority, String resourceId, String location, String createdByEmail) {
        int count = 0;
        if (status != null) count++;
        if (priority != null) count++;
        if (resourceId != null) count++;
        if (location != null) count++;
        if (createdByEmail != null) count++;
        return count;
    }

    private TicketComment findComment(Ticket ticket, String commentId) {
        return ticket.getComments().stream()
                .filter(comment -> comment.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new TicketNotFoundException("Comment not found: " + commentId));
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
