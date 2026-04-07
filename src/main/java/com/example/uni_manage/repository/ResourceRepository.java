package com.example.uni_manage.repository;

import com.example.uni_manage.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(String type);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(String status);
}
