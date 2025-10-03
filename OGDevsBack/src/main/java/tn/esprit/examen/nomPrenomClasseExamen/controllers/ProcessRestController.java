package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ProcessDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.IndicatorDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.services.IIndicatorServices;
import tn.esprit.examen.nomPrenomClasseExamen.services.IProcessServices;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Process")
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class ProcessRestController {

    private final IProcessServices iProcessServices;
    private final IIndicatorServices indicatorServices;

    @PostMapping()
    public ResponseEntity<?> addProcess(@RequestBody Process p) {
        try {
            log.info("Received request to add Process: {}", p);
            Process createdProcess = iProcessServices.addProcess(p);
            log.info("Process added successfully with ID: {}", createdProcess.getId());
            return ResponseEntity.ok(createdProcess);
        } catch (IllegalArgumentException e) {
            log.error("Error adding Process", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error adding Process", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to add process: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProcess(@PathVariable Long id, @RequestBody Process process) {
        try {
            log.info("Received request to update Process with ID: {}", id);
            Process updatedProcess = iProcessServices.updateProcess(id, process);
            if (updatedProcess == null) {
                log.warn("Process with ID: {} not found", id);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Process with ID " + id + " does not exist.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            log.info("Process updated successfully with ID: {}", updatedProcess.getId());
            return ResponseEntity.ok(updatedProcess);
        } catch (IllegalArgumentException e) {
            log.error("Error updating Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error updating Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update process: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProcess(@PathVariable Long id) {
        try {
            log.info("Received request to delete Process with ID: {}", id);
            iProcessServices.deleteProcess(id);
            log.info("Process deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error deleting Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete process: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProcessById(@PathVariable Long id) {
        try {
            log.info("Fetching Process with ID: {}", id);
            Process process = iProcessServices.getProcessById(id);
            if (process == null) {
                log.warn("Process with ID: {} not found", id);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Process with ID " + id + " does not exist.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            log.info("Process fetched successfully with ID: {}", id);
            return ResponseEntity.ok(process);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error fetching Process with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch process: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProcesses() {
        try {
            log.info("Fetching all Processes");
            List<ProcessDTO> processes = iProcessServices.getAllProcesses();
            log.info("Fetched {} Processes", processes.size());
            return ResponseEntity.ok(processes);
        } catch (Exception e) {
            log.error("Error fetching all Processes", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch processes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{processId}/assignOperation/{operationId}")
    public ResponseEntity<?> assignOperationToProcess(@PathVariable Long processId, @PathVariable Long operationId) {
        try {
            log.info("Received request to assign Operation {} to Process {}", operationId, processId);
            iProcessServices.assignOperationToProcess(processId, operationId);
            log.info("Operation {} assigned to Process {} successfully", operationId, processId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Operation assigned to Process successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning Operation {} to Process {}", operationId, processId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error assigning Operation {} to Process {}", operationId, processId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign operation to process: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PostMapping("/{processId}/assignObjective/{objectiveId}")
    public ResponseEntity<?> assignObjectiveToProcess(@PathVariable Long processId, @PathVariable Long objectiveId) {
        try {
            log.info("Requête reçue pour assigner l'objectif {} au processus {}", objectiveId, processId);
            iProcessServices.assignObjectiveToProcess(processId, objectiveId);
            log.info("Objectif {} assigné au processus {} avec succès", objectiveId, processId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Objectif assigné au processus avec succès !");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Erreur lors de l'assignation de l'objectif {} au processus {}", objectiveId, processId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Erreur inattendue lors de l'assignation de l'objectif {} au processus {}", objectiveId, processId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Échec de l'assignation de l'objectif au processus : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/{processId}/indicators")
    public ResponseEntity<List<IndicatorDTO>> getIndicatorsForProcess(@PathVariable Long processId) {
        List<IndicatorDTO> indicators = indicatorServices.getIndicatorsForProcess(processId);
        return ResponseEntity.ok(indicators);
    }
    @GetMapping("/stats/total")
    public ResponseEntity<?> getTotalProcesses() {
        try {
            log.info("Fetching total number of processes");
            long total = iProcessServices.getTotalProcesses();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            log.error("Error fetching total processes", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch total processes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-operations")
    public ResponseEntity<?> getAverageOperationsPerProcess() {
        try {
            log.info("Fetching average operations per process");
            double average = iProcessServices.getAverageOperationsPerProcess();
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            log.error("Error fetching average operations", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch average operations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-duration")
    public ResponseEntity<?> getAverageProcessDuration() {
        try {
            log.info("Fetching average process duration");
            double duration = iProcessServices.getAverageProcessDuration();
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
            double rate = iProcessServices.getCompletionRate();
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            log.error("Error fetching completion rate", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch completion rate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/by-pilote")
    public ResponseEntity<?> getProcessesByPilote() {
        try {
            log.info("Fetching processes by pilote");
            Map<String, Long> processesByPilote = iProcessServices.getProcessesByPilote();
            return ResponseEntity.ok(processesByPilote);
        } catch (Exception e) {
            log.error("Error fetching processes by pilote", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch processes by pilote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/stats/operations-duration-correlation")
    public ResponseEntity<?> getOperationsDurationCorrelation() {
        try {
            log.info("Fetching operations-duration correlation");
            double correlation = iProcessServices.getOperationsDurationCorrelation();
            return ResponseEntity.ok(correlation);
        } catch (Exception e) {
            log.error("Error fetching operations-duration correlation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch operations-duration correlation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}