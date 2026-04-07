package com.example.uni_manage.service;

import com.example.uni_manage.exception.ResourceNotFoundException;
import com.example.uni_manage.model.Resource;
import com.example.uni_manage.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

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
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    // නව resource එකක් හදන්න
    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null || resource.getStatus().isBlank()) {
            resource.setStatus("ACTIVE");
        }
        normalizeResourceFields(resource);
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
        normalizeResourceFields(existing);
        return resourceRepository.save(existing);
    }

    // Resource delete කරන්න
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // Filter කරන්න
    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type.toUpperCase(Locale.ROOT));
    }

    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public List<Resource> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status.toUpperCase(Locale.ROOT));
    }

    public List<Resource> getResourcesByMinCapacity(int minCapacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
    }

    public List<Resource> filterResources(
            String type,
            String location,
            String status,
            Integer minCapacity
    ) {
        int filters = countProvided(type, location, status, minCapacity);
        if (filters == 0) {
            return getAllResources();
        }
        if (filters == 1) {
            if (type != null) return getResourcesByType(type);
            if (location != null) return getResourcesByLocation(location);
            if (status != null) return getResourcesByStatus(status);
            return getResourcesByMinCapacity(minCapacity);
        }

        Stream<Resource> stream = getAllResources().stream();
        if (type != null) {
            String normalizedType = type.toLowerCase(Locale.ROOT);
            stream = stream.filter(resource -> resource.getType() != null
                    && resource.getType().toLowerCase(Locale.ROOT).equals(normalizedType));
        }
        if (location != null) {
            String normalizedLocation = location.toLowerCase(Locale.ROOT);
            stream = stream.filter(resource -> resource.getLocation() != null
                    && resource.getLocation().toLowerCase(Locale.ROOT).equals(normalizedLocation));
        }
        if (status != null) {
            String normalizedStatus = status.toLowerCase(Locale.ROOT);
            stream = stream.filter(resource -> resource.getStatus() != null
                    && resource.getStatus().toLowerCase(Locale.ROOT).equals(normalizedStatus));
        }
        if (minCapacity != null) {
            stream = stream.filter(resource -> resource.getCapacity() >= minCapacity);
        }

        return stream.toList();
    }

    private int countProvided(String type, String location, String status, Integer minCapacity) {
        int count = 0;
        if (type != null) count++;
        if (location != null) count++;
        if (status != null) count++;
        if (minCapacity != null) count++;
        return count;
    }

    private void normalizeResourceFields(Resource resource) {
        if (resource.getType() != null) {
            resource.setType(resource.getType().toUpperCase(Locale.ROOT));
        }
        if (resource.getStatus() != null) {
            resource.setStatus(resource.getStatus().toUpperCase(Locale.ROOT));
        }
    }
}
