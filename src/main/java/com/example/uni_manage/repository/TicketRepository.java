package com.example.uni_manage.repository;

import com.example.uni_manage.model.Ticket;
import com.example.uni_manage.model.TicketPriority;
import com.example.uni_manage.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedByEmail(String createdByEmail);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByResourceId(String resourceId);
    List<Ticket> findByLocation(String location);
}
