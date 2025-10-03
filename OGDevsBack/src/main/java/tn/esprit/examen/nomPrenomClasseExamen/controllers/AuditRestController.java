package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Audit;
import tn.esprit.examen.nomPrenomClasseExamen.services.IAuditService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audits")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class AuditRestController {

    private final IAuditService auditService;

    @PostMapping
    public ResponseEntity<?> createAudit(@RequestBody Audit audit) {
        try {
            log.info("Received request to create Audit: {}", audit);
            Audit createdAudit = auditService.createAudit(audit);
            log.info("Audit created successfully with ID: {}", createdAudit.getId());
            return ResponseEntity.ok(createdAudit);
        } catch (IllegalArgumentException e) {
            log.error("Error creating Audit", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error creating Audit", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create audit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllAudits() {
        try {
            log.info("Fetching all Audits");
            List<Audit> audits = auditService.getAllAudits(); // Changed from getAudits() to getAllAudits()
            log.info("Fetched {} Audits", audits.size());
            return ResponseEntity.ok(audits);
        } catch (Exception e) {
            log.error("Error fetching all Audits", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch audits: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAuditById(@PathVariable Long id) {
        try {
            log.info("Fetching Audit with ID: {}", id);
            Audit audit = auditService.getAuditById(id);
            log.info("Audit fetched successfully with ID: {}", id);
            return ResponseEntity.ok(audit);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error fetching Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch audit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAudit(@PathVariable Long id, @RequestBody Audit audit) {
        try {
            log.info("Received request to update Audit with ID: {}", id);
            Audit updatedAudit = auditService.updateAudit(id, audit);
            log.info("Audit updated successfully with ID: {}", updatedAudit.getId());
            return ResponseEntity.ok(updatedAudit);
        } catch (IllegalArgumentException e) {
            log.error("Error updating Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error updating Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update audit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAudit(@PathVariable Long id) {
        try {
            log.info("Received request to delete Audit with ID: {}", id);
            auditService.deleteAudit(id);
            log.info("Audit deleted successfully with ID: {}", id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Audit deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error deleting Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error deleting Audit with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete audit: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}