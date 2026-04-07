package com.example.uni_manage.repository;

import com.example.uni_manage.model.Booking;
import com.example.uni_manage.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String userEmail);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByDate(LocalDate date);
    List<Booking> findByResourceIdAndDateAndStatusIn(String resourceId, LocalDate date, List<BookingStatus> statuses);
}
