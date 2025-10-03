package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.OperationDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;
import tn.esprit.examen.nomPrenomClasseExamen.services.OperationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/operations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class OperationRestController {

    private final OperationService operationService;

    @PostMapping
    public ResponseEntity<?> addOperation(@RequestBody Operation operation) {
        try {
            log.info("Received request to add Operation: {}", operation);
            Operation createdOperation = operationService.addOperation(operation);
            log.info("Operation added successfully with ID: {}", createdOperation.getId());
            return ResponseEntity.ok(createdOperation);
        } catch (IllegalArgumentException e) {
            log.error("Error adding Operation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error adding Operation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to add operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllOperations() {
        try {
            log.info("Fetching all Operations");
            List<OperationDTO> operations = operationService.getAllOperations();
            log.info("Fetched {} Operations", operations.size());
            return ResponseEntity.ok(operations);
        } catch (Exception e) {
            log.error("Error fetching all Operations", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch operations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOperationById(@PathVariable Long id) {
        try {
            log.info("Fetching Operation with ID: {}", id);
            Operation operation = operationService.getOperationById(id);
            log.info("Operation fetched successfully with ID: {}", id);
            return ResponseEntity.ok(operation);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error fetching Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOperation(@PathVariable Long id, @RequestBody Operation updatedOperation) {
        try {
            log.info("Received request to update Operation with ID: {}", id);
            Operation operation = operationService.updateOperation(id, updatedOperation);
            log.info("Operation updated successfully with ID: {}", operation.getId());
            return ResponseEntity.ok(operation);
        } catch (IllegalArgumentException e) {
            log.error("Error updating Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error updating Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOperation(@PathVariable Long id) {
        try {
            log.info("Received request to delete Operation with ID: {}", id);
            operationService.deleteOperation(id);
            log.info("Operation deleted successfully with ID: {}", id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Operation deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error deleting Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error deleting Operation with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{operationId}/assignTask/{taskId}")
    public ResponseEntity<?> assignTaskToOperation(@PathVariable Long operationId, @PathVariable Long taskId) {
        try {
            log.info("Received request to assign Task {} to Operation {}", taskId, operationId);
            operationService.assignTaskToOperation(operationId, taskId);
            log.info("Task {} assigned to Operation {} successfully", taskId, operationId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Task assigned to Operation successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning Task {} to Operation {}", taskId, operationId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error assigning Task {} to Operation {}", taskId, operationId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign task to operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{operationId}/postes")
    public ResponseEntity<?> getPostesForOperation(@PathVariable Long operationId) {
        try {
            log.info("Fetching postes for Operation with ID: {}", operationId);
            Set<Poste> postes = operationService.getPostesForOperation(operationId);
            log.info("Fetched {} postes for Operation with ID: {}", postes.size(), operationId);
            return ResponseEntity.ok(postes);
        } catch (RuntimeException e) {
            log.error("Error fetching postes for Operation with ID: {}", operationId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error fetching postes for Operation with ID: {}", operationId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch postes for operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{operationId}/assignPostes")
    public ResponseEntity<?> assignPostesToOperation(@PathVariable Long operationId, @RequestBody Set<Long> posteIds) {
        try {
            log.info("Received request to assign postes {} to Operation {}", posteIds, operationId);
            operationService.assignPostesToOperation(operationId, posteIds);
            log.info("Postes {} assigned to Operation {} successfully", posteIds, operationId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Postes assigned to Operation successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning postes to Operation {}: {}", operationId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error assigning postes to Operation {}: {}", operationId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign postes to operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/stats/total")
    public ResponseEntity<?> getTotalOperations() {
        try {
            log.info("Fetching total number of operations");
            long total = operationService.getTotalOperations();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            log.error("Error fetching total operations", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch total operations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-tasks")
    public ResponseEntity<?> getAverageTasksPerOperation() {
        try {
            log.info("Fetching average tasks per operation");
            double average = operationService.getAverageTasksPerOperation();
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            log.error("Error fetching average tasks", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch average tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-duration")
    public ResponseEntity<?> getAverageOperationDuration() {
        try {
            log.info("Fetching average operation duration");
            double duration = operationService.getAverageOperationDuration();
            return ResponseEntity.ok(duration);
        } catch (Exception e) {
            log.error("Error fetching average duration", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch average duration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/completion-rate")
    public ResponseEntity<?> getCompletionRate() {
        try {
            log.info("Fetching completion rate");
            double rate = operationService.getCompletionRate();
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            log.error("Error fetching completion rate", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch completion rate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/by-user")
    public ResponseEntity<?> getOperationsByUser() {
        try {
            log.info("Fetching operations by user");
            Map<String, Long> operationsByUser = operationService.getOperationsByUser();
            return ResponseEntity.ok(operationsByUser);
        } catch (Exception e) {
            log.error("Error fetching operations by user", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch operations by user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/tasks-duration-correlation")
    public ResponseEntity<?> getTasksDurationCorrelation() {
        try {
            log.info("Fetching tasks-duration correlation");
            double correlation = operationService.getTasksDurationCorrelation();
            return ResponseEntity.ok(correlation);
        } catch (Exception e) {
            log.error("Error fetching tasks-duration correlation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch tasks-duration correlation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}