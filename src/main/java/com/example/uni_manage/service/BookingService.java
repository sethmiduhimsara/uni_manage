package com.example.uni_manage.service;

import com.example.uni_manage.dto.BookingRequest;
import com.example.uni_manage.exception.BadRequestException;
import com.example.uni_manage.exception.BookingConflictException;
import com.example.uni_manage.exception.BookingNotFoundException;
import com.example.uni_manage.exception.ForbiddenOperationException;
import com.example.uni_manage.exception.ResourceNotFoundException;
import com.example.uni_manage.model.Booking;
import com.example.uni_manage.model.BookingStatus;
import com.example.uni_manage.model.NotificationType;
import com.example.uni_manage.repository.BookingRepository;
import com.example.uni_manage.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final List<BookingStatus> CONFLICT_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public Booking createBooking(BookingRequest request, String userEmail) {
        validateTimeRange(request.startTime(), request.endTime());
        ensureResourceExists(request.resourceId());
        ensureNoConflicts(request.resourceId(), request.date(), request.startTime(), request.endTime());

        Booking booking = new Booking();
        booking.setResourceId(request.resourceId());
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose());
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setUserEmail(userEmail);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForUser(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public List<Booking> getBookingsForAdmin(
            String status,
            String resourceId,
            LocalDate date,
            String userEmail
    ) {
        int filters = countProvided(status, resourceId, date, userEmail);
        if (filters == 0) {
            return bookingRepository.findAll();
        }
        if (filters == 1) {
            if (status != null) return bookingRepository.findByStatus(parseStatus(status));
            if (resourceId != null) return bookingRepository.findByResourceId(resourceId);
            if (date != null) return bookingRepository.findByDate(date);
            return bookingRepository.findByUserEmail(userEmail);
        }

        Stream<Booking> stream = bookingRepository.findAll().stream();
        if (status != null) {
            BookingStatus parsedStatus = parseStatus(status);
            stream = stream.filter(booking -> booking.getStatus() == parsedStatus);
        }
        if (resourceId != null) {
            stream = stream.filter(booking -> booking.getResourceId() != null
                    && booking.getResourceId().equals(resourceId));
        }
        if (date != null) {
            stream = stream.filter(booking -> booking.getDate() != null
                    && booking.getDate().equals(date));
        }
        if (userEmail != null) {
            String normalizedEmail = userEmail.toLowerCase(Locale.ROOT);
            stream = stream.filter(booking -> booking.getUserEmail() != null
                    && booking.getUserEmail().toLowerCase(Locale.ROOT).equals(normalizedEmail));
        }
        return stream.toList();
    }

    public Booking approveBooking(String id, String reason) {
        Booking booking = getBooking(id);
        ensurePending(booking);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminDecisionReason(reason);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUserEmail(),
                NotificationType.BOOKING_APPROVED,
                "Booking approved",
                "Your booking has been approved.",
                booking.getId()
        );
        return saved;
    }

    public Booking rejectBooking(String id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }
        Booking booking = getBooking(id);
        ensurePending(booking);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminDecisionReason(reason);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUserEmail(),
                NotificationType.BOOKING_REJECTED,
                "Booking rejected",
                "Your booking was rejected. Reason: " + reason,
                booking.getId()
        );
        return saved;
    }

    public Booking cancelBooking(String id, String requesterEmail, boolean isAdmin) {
        Booking booking = getBooking(id);
        if (!isAdmin && !booking.getUserEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenOperationException("You are not allowed to cancel this booking");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUserEmail(),
                NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                "Your booking has been cancelled.",
                booking.getId()
        );
        return saved;
    }

    private Booking getBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
    }

    private void ensurePending(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking must be PENDING for this action");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void ensureResourceExists(String resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found with id: " + resourceId);
        }
    }

    private void ensureNoConflicts(String resourceId, LocalDate date, LocalTime start, LocalTime end) {
        List<Booking> existing = bookingRepository.findByResourceIdAndDateAndStatusIn(
                resourceId,
                date,
                CONFLICT_STATUSES
        );
        for (Booking booking : existing) {
            if (isOverlapping(start, end, booking.getStartTime(), booking.getEndTime())) {
                throw new BookingConflictException("Booking conflicts with existing schedule");
            }
        }
    }

    private boolean isOverlapping(LocalTime start, LocalTime end, LocalTime otherStart, LocalTime otherEnd) {
        return start.isBefore(otherEnd) && end.isAfter(otherStart);
    }

    private BookingStatus parseStatus(String status) {
        try {
            return BookingStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Use PENDING, APPROVED, REJECTED, or CANCELLED");
        }
    }

    private int countProvided(String status, String resourceId, LocalDate date, String userEmail) {
        int count = 0;
        if (status != null) count++;
        if (resourceId != null) count++;
        if (date != null) count++;
        if (userEmail != null) count++;
        return count;
    }
}
