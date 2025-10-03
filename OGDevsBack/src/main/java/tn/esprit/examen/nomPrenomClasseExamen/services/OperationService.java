package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.OperationDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OperationService implements IOperationService {

    private final OperationRepository operationRepository;
    private final ProcessRepository processRepository;
    private final TaskRepository taskRepository;
    private final PosteRepository posteRepository;
    private final UserEntityRepository userEntityRepository;
    private final AuditService auditService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Operation addOperation(Operation operation) {
        if (operation.getProcess() != null && operation.getProcess().getId() != null) {
            Process process = processRepository.findById(operation.getProcess().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Process with ID " + operation.getProcess().getId() + " does not exist."));
            operation.setProcess(process);
            process.getOperations().add(operation);
        }

        // Ajout des nouveaux champs
        if (operation.getCreationDate() == null) {
            operation.setCreationDate(LocalDate.now());
        }
        operation.setFinishDate(operation.getFinishDate());

        Operation savedOperation = operationRepository.save(operation);
        log.info("Operation added successfully with ID: {}", savedOperation.getId());
        return savedOperation;
    }

    @Override
    public Operation updateOperation(Long operationId, Operation updatedOperation) {
        Operation existingOperation = operationRepository.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));

        existingOperation.setOperationName(updatedOperation.getOperationName());
        existingOperation.setOperationDescription(updatedOperation.getOperationDescription());
        // Ajout des nouveaux champs
        existingOperation.setCreationDate(updatedOperation.getCreationDate());
        existingOperation.setFinishDate(updatedOperation.getFinishDate());

        if (updatedOperation.getProcess() != null && updatedOperation.getProcess().getId() != null) {
            Process process = processRepository.findById(updatedOperation.getProcess().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Process with ID " + updatedOperation.getProcess().getId() + " does not exist."));
            if (existingOperation.getProcess() != null && !existingOperation.getProcess().getId().equals(process.getId())) {
                existingOperation.getProcess().getOperations().remove(existingOperation);
            }
            existingOperation.setProcess(process);
            process.getOperations().add(existingOperation);
        } else {
            if (existingOperation.getProcess() != null) {
                existingOperation.getProcess().getOperations().remove(existingOperation);
                existingOperation.setProcess(null);
            }
        }

        Operation savedOperation = operationRepository.save(existingOperation);
        log.info("Operation updated successfully with ID: {}", savedOperation.getId());
        return savedOperation;
    }

    @Override
    public void deleteOperation(Long operationId) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));

        if (operation.getProcess() != null) {
            operation.getProcess().getOperations().remove(operation);
            operation.setProcess(null);
        }

        operationRepository.delete(operation);
        log.info("Operation deleted successfully with ID: {}", operationId);
    }

    @Override
    public Operation getOperationById(Long operationId) {
        Operation operation = operationRepository.findByIdWithProcessAndTasks(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));
        return operation;
    }

    @Override
    public List<OperationDTO> getAllOperations() {
        List<Operation> operations = operationRepository.findAll();
        return operations.stream().map(operation -> {
            OperationDTO dto = new OperationDTO();
            dto.setId(operation.getId());
            dto.setOperationName(operation.getOperationName());
            dto.setOperationDescription(operation.getOperationDescription());
            dto.setCreationDate(operation.getCreationDate());
            dto.setFinishDate(operation.getFinishDate());
            if (operation.getProcess() != null) {
                dto.setProcessId(operation.getProcess().getId());
                dto.setProcessName(operation.getProcess().getProcName());
            }
            dto.setTaskNames(operation.getTasks().stream()
                    .map(Task::getTaskDescription)
                    .collect(Collectors.toList()));
            dto.setAssignedUsers(operation.getUserEntities().stream()
                    .map(UserEntity::getUsername)
                    .collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void assignTaskToOperation(Long operationId, Long taskId) {
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + taskId + " does not exist."));

        if (task.getOperation() != null) {
            Operation oldOperation = task.getOperation();
            oldOperation.getTasks().remove(task);
            operationRepository.save(oldOperation);
        }

        task.setOperation(operation);
        operation.getTasks().add(task);

        taskRepository.save(task);
        operationRepository.save(operation);
        if (operation.getTasks().size() > 5){
            String message = String.format("Operation %s has been assigned more than 5 tasks.", operation.getOperationName());
            messagingTemplate.convertAndSend("/room/notifications", message);
            log.info("Notification sent: {}", message);
        }

        if (operation.getTasks().size() > 8) {
            Audit audit = new Audit();
            audit.setTitle("Audit interne pour l'opération " + operation.getOperationName());
            audit.setDescription("L'opération a été assignée à plus de 8 tâches.");
            audit.setStartDate(LocalDate.now());
            audit.setEndDate(LocalDate.now().plusDays(7)); // Audit d'une semaine
            audit.setOperation(operation);
            auditService.createAudit(audit);
            log.info("Audit créé pour l'opération {}  avec plus de 8 tâches.", operation.getOperationName());
        }

        log.info("Task {} assigned to Operation {}", taskId, operationId);
    }
    @Override
    public Set<Poste> getPostesForOperation(Long operationId) {
        try {
            log.info("Fetching postes for operation with ID: {}", operationId);
            Set<Poste> postes = operationRepository.findPostesByOperationId(operationId);

            if (postes.isEmpty()) {
                log.warn("No postes found for operation ID: {}", operationId);
            } else {
                log.info("Found {} postes for operation ID: {}", postes.size(), operationId);
            }
            return postes;
        } catch (Exception e) {
            log.error("Error fetching postes for operation with ID: {}", operationId, e);
            throw new RuntimeException("Failed to fetch postes for operation: " + e.getMessage(), e);
        }
    }

    @Override
    public void assignPostesToOperation(Long operationId, Set<Long> posteIds) {
        try {
            log.info("Assigning postes {} to operation with ID: {}", posteIds, operationId);

            Operation operation = operationRepository.findById(operationId)
                    .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));

            Set<Poste> postesToAssign = posteIds.stream()
                    .map(posteId -> posteRepository.findById(posteId)
                            .orElseThrow(() -> new IllegalArgumentException("Poste with ID " + posteId + " does not exist.")))
                    .collect(Collectors.toSet());

            for (Poste poste : postesToAssign) {
                UserEntity userEntity = poste.getUserEntity();
                if (userEntity == null) {
                    log.warn("Poste with ID {} has no associated UserEntity; skipping assignment", poste.getId());
                    continue;
                }

                Set<Operation> userOperations = userEntity.getOperations();
                if (!userOperations.contains(operation)) {
                    userOperations.add(operation);
                    userEntityRepository.save(userEntity);
                }

                if (!operation.getUserEntities().contains(userEntity)) {
                    operation.getUserEntities().add(userEntity);
                }
            }

            operationRepository.save(operation);
            log.info("Successfully assigned {} postes to Operation ID: {}", postesToAssign.size(), operationId);
        } catch (Exception e) {
            log.error("Error assigning postes to operation with ID: {}", operationId, e);
            throw new RuntimeException("Failed to assign postes to operation: " + e.getMessage(), e);
        }
    }
    @Override
    public long getTotalOperations() {
        long total = operationRepository.count();
        log.info("Total operations: {}", total);
        return total;
    }

    @Override
    public double getAverageTasksPerOperation() {
        List<Operation> operations = operationRepository.findAll();
        if (operations.isEmpty()) {
            return 0.0;
        }
        double average = operations.stream()
                .mapToInt(operation -> operation.getTasks() != null ? operation.getTasks().size() : 0)
                .average()
                .orElse(0.0);
        log.info("Average tasks per operation: {}", average);
        return average;
    }

    @Override
    public double getAverageOperationDuration() {
        List<Operation> operations = operationRepository.findAll();
        if (operations.isEmpty()) {
            return 0.0;
        }
        double averageDuration = operations.stream()
                .filter(o -> o.getCreationDate() != null && o.getFinishDate() != null)
                .mapToLong(o -> ChronoUnit.DAYS.between(o.getCreationDate(), o.getFinishDate()))
                .average()
                .orElse(0.0);
        log.info("Average operation duration (days): {}", averageDuration);
        return averageDuration;
    }

    @Override
    public double getCompletionRate() {
        List<Operation> operations = operationRepository.findAll();
        if (operations.isEmpty()) {
            return 0.0;
        }
        long completed = operations.stream()
                .filter(o -> o.getFinishDate() != null)
                .count();
        double completionRate = (double) completed / operations.size() * 100;
        log.info("Completion rate: {}%", completionRate);
        return completionRate;
    }

    @Override
    public Map<String, Long> getOperationsByUser() {
        List<Operation> operations = operationRepository.findAll();
        Map<String, Long> operationsByUser = operations.stream()
                .filter(o -> o.getUserEntities() != null && !o.getUserEntities().isEmpty())
                .flatMap(o -> o.getUserEntities().stream())
                .collect(Collectors.groupingBy(
                        UserEntity::getUsername,
                        Collectors.counting()
                ));
        log.info("Operations by user: {}", operationsByUser);
        return operationsByUser;
    }

    @Override
    public double getTasksDurationCorrelation() {
        List<Operation> operations = operationRepository.findAll();
        if (operations.size() < 2 || operations.stream().noneMatch(o -> o.getFinishDate() != null && o.getTasks() != null)) {
            log.warn("Not enough data to calculate correlation");
            return 0.0;
        }

        double[] tasks = operations.stream()
                .filter(o -> o.getTasks() != null)
                .mapToDouble(o -> o.getTasks().size())
                .toArray();
        double[] durations = operations.stream()
                .filter(o -> o.getCreationDate() != null && o.getFinishDate() != null)
                .mapToDouble(o -> ChronoUnit.DAYS.between(o.getCreationDate(), o.getFinishDate()))
                .toArray();

        if (tasks.length != durations.length) {
            log.warn("Mismatch in data arrays for correlation calculation");
            return 0.0;
        }

        double meanTasks = java.util.Arrays.stream(tasks).average().orElse(0.0);
        double meanDuration = java.util.Arrays.stream(durations).average().orElse(0.0);

        double numerator = 0.0;
        double denominatorX = 0.0;
        double denominatorY = 0.0;

        for (int i = 0; i < tasks.length; i++) {
            double diffX = tasks[i] - meanTasks;
            double diffY = durations[i] - meanDuration;
            numerator += diffX * diffY;
            denominatorX += diffX * diffX;
            denominatorY += diffY * diffY;
        }

        double correlation = numerator / Math.sqrt(denominatorX * denominatorY);
        log.info("Tasks-Duration Correlation: {}", correlation);
        return Double.isNaN(correlation) ? 0.0 : correlation;
    }
}