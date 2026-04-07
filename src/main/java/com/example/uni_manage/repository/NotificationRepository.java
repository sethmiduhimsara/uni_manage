package com.example.uni_manage.repository;

import com.example.uni_manage.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Notification> findByUserEmailAndReadFalseOrderByCreatedAtDesc(String userEmail);
}
