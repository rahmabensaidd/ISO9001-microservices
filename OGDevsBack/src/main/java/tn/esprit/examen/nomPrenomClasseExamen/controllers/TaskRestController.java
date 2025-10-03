package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.TaskDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import tn.esprit.examen.nomPrenomClasseExamen.services.TaskServices;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class TaskRestController {

    private final TaskServices taskServices;

    @PostMapping()
    public ResponseEntity<Task> addTask(@RequestBody Task task) {
        log.info("Received request to create Task: {}", task);
        Task createdTask = taskServices.createTask(task);
        log.info("Task created successfully with ID: {}", createdTask.getId());
        return ResponseEntity.ok(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        log.info("Fetching all Tasks");
        List<TaskDTO> tasks = taskServices.getAllTasks();
        log.info("Fetched {} Tasks", tasks.size());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        log.info("Fetching Task with ID: {}", id);
        Task task = taskServices.getTaskById(id)
                .orElseThrow(() -> {
                    log.warn("Task with ID: {} not found", id);
                    return new RuntimeException("Task with ID " + id + " not found");
                });
        log.info("Task fetched successfully with ID: {}", id);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        log.info("Received request to update Task with ID: {}", id);
        Task task = taskServices.updateTask(id, updatedTask);
        log.info("Task updated successfully with ID: {}", task.getId());
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        log.info("Received request to delete Task with ID: {}", id);
        taskServices.deleteTask(id);
        log.info("Task deleted successfully with ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully!"));
    }

    @PostMapping("/{taskId}/assigndata")
    public ResponseEntity<Task> assignDataToTask(@PathVariable Long taskId, @RequestBody Set<Long> dataIds) {
        log.info("Received request to assign Data IDs {} to Task with ID: {}", dataIds, taskId);
        Task updatedTask = taskServices.datasToTask(taskId, dataIds);
        log.info("Data assigned successfully to Task with ID: {}", taskId);
        return ResponseEntity.ok(updatedTask);
    }
    @GetMapping("/stats/total")
    public ResponseEntity<?> getTotalTasks() {
        try {
            log.info("Fetching total number of tasks");
            long total = taskServices.getTotalTasks();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            log.error("Error fetching total tasks", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch total tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-data")
    public ResponseEntity<?> getAverageDataPerTask() {
        try {
            log.info("Fetching average data entries per task");
            double average = taskServices.getAverageDataPerTask();
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            log.error("Error fetching average data entries", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch average data entries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/avg-duration")
    public ResponseEntity<?> getAverageTaskDuration() {
        try {
            log.info("Fetching average task duration");
            double duration = taskServices.getAverageTaskDuration();
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
            log.info("Fetching task completion rate");
            double rate = taskServices.getCompletionRate();
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            log.error("Error fetching completion rate", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch completion rate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/by-operation")
    public ResponseEntity<?> getTasksByOperation() {
        try {
            log.info("Fetching tasks by operation");
            Map<String, Long> tasksByOperation = taskServices.getTasksByOperation();
            return ResponseEntity.ok(tasksByOperation);
        } catch (Exception e) {
            log.error("Error fetching tasks by operation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch tasks by operation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stats/data-duration-correlation")
    public ResponseEntity<?> getDataDurationCorrelation() {
        try {
            log.info("Fetching data-duration correlation");
            double correlation = taskServices.getDataDurationCorrelation();
            return ResponseEntity.ok(correlation);
        } catch (Exception e) {
            log.error("Error fetching data-duration correlation", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch data-duration correlation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}