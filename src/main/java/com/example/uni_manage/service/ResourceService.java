package com.example.uni_manage.service;

import com.example.uni_manage.model.Resource;
import com.example.uni_manage.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // සියලුම resources ගන්න
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // ID එකෙන් resource ගන්න
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    // නව resource එකක් හදන්න
    public Resource createResource(Resource resource) {
        resource.setStatus("ACTIVE");
        return resourceRepository.save(resource);
    }

    // Resource update කරන්න
    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);
        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setLocation(updatedResource.getLocation());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setStatus(updatedResource.getStatus());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
        existing.setDescription(updatedResource.getDescription());
        return resourceRepository.save(existing);
    }

    // Resource delete කරන්න
    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    // Filter කරන්න
    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public List<Resource> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status);
    }
}
