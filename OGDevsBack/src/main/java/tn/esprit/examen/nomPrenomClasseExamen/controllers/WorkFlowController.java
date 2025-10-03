package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.WorkFlow;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import tn.esprit.examen.nomPrenomClasseExamen.services.WorkFlowService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/workflow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Validated
@Slf4j
public class WorkFlowController {
    private final WorkFlowService workFlowService;

    @PostMapping("/save")
    public ResponseEntity<?> saveWorkflow(@RequestBody WorkFlow workflow) {
        try {
            log.info("Received workflow: name={}, processes={}, snapshot length={}",
                    workflow.getName(),
                    workflow.getProcesses() != null ? workflow.getProcesses().size() : 0,
                    workflow.getPaperSnapshot() != null ? workflow.getPaperSnapshot().length() : 0);

            if (workflow == null || workflow.getName() == null || workflow.getName().trim().isEmpty()) {
                log.warn("Validation failed: Workflow or name is null/empty");
                return ResponseEntity.badRequest().body("Erreur : Le workflow doit avoir un nom non vide.");
            }

            if (workflow.getProcesses() == null || workflow.getProcesses().isEmpty()) {
                log.warn("Validation failed: Workflow processes are null/empty");
                return ResponseEntity.badRequest().body("Erreur : Le workflow doit contenir au moins un processus.");
            }

            // Validate for duplicate IDs in processes
            Set<Long> processIds = new HashSet<>();
            for (Process process : workflow.getProcesses()) {
                if (process == null || process.getProcName() == null || process.getProcName().trim().isEmpty()) {
                    log.warn("Invalid process: procName is null or empty");
                    return ResponseEntity.badRequest().body("Erreur : Chaque processus doit avoir un nom non vide.");
                }
                if (process.getId() != null && !processIds.add(process.getId())) {
                    log.warn("Duplicate process ID found: {}", process.getId());
                    return ResponseEntity.badRequest().body("Erreur : Les processus contiennent des IDs en double.");
                }

                // Validate for duplicate IDs in operations
                Set<Long> operationIds = new HashSet<>();
                if (process.getOperations() != null) {
                    for (Operation operation : process.getOperations()) {
                        if (operation == null || operation.getOperationName() == null || operation.getOperationName().trim().isEmpty()) {
                            log.warn("Invalid operation: operationName is null or empty");
                            return ResponseEntity.badRequest().body("Erreur : Chaque opération doit avoir un nom non vide.");
                        }
                        if (operation.getId() != null && !operationIds.add(operation.getId())) {
                            log.warn("Duplicate operation ID found: {}", operation.getId());
                            return ResponseEntity.badRequest().body("Erreur : Les opérations contiennent des IDs en double.");
                        }

                        // Validate for duplicate IDs in tasks
                        Set<Long> taskIds = new HashSet<>();
                        if (operation.getTasks() != null) {
                            for (Task task : operation.getTasks()) {
                                if (task == null || task.getTaskDescription() == null || task.getTaskDescription().trim().isEmpty()) {
                                    log.warn("Invalid task: taskDescription is null or empty");
                                    return ResponseEntity.badRequest().body("Erreur : Chaque tâche doit avoir une description non vide.");
                                }
                                if (task.getId() != null && !taskIds.add(task.getId())) {
                                    log.warn("Duplicate task ID found: {}", task.getId());
                                    return ResponseEntity.badRequest().body("Erreur : Les tâches contiennent des IDs en double.");
                                }
                            }
                        }
                    }
                }
            }

            WorkFlow savedWorkflow = workFlowService.saveWorkFlow(workflow);
            log.info("Workflow saved successfully with ID: {}", savedWorkflow.getId());
            return ResponseEntity.ok(savedWorkflow);
        } catch (Exception e) {
            log.error("Error saving workflow: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la sauvegarde du workflow : " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkFlow> getWorkflowById(@PathVariable Long id) {
        WorkFlow workflow = workFlowService.getWorkflowById(id);
        if (workflow == null) {
            log.warn("No workflow found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(workflow);
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<WorkFlow> getWorkflowByName(@PathVariable String name) {
        WorkFlow workflow = workFlowService.getWorkflowByName(name);
        if (workflow == null) {
            log.warn("No workflow found with name: {}", name);
            return ResponseEntity.notFound().build();
        }
        log.info("Retrieved workflow with name: {}", name);
        return ResponseEntity.ok(workflow);
    }

    @GetMapping("/all")
    public ResponseEntity<List<WorkFlow>> getAllWorkflows() {
        return ResponseEntity.ok(workFlowService.getAllWorkflows());
    }

    @GetMapping("/{id}/snapshot")
    public ResponseEntity<String> getWorkflowSnapshot(@PathVariable Long id) {
        String snapshot = workFlowService.getWorkflowSnapshot(id);
        if (snapshot == null) {
            log.warn("No snapshot found for workflow ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(snapshot);
    }
}