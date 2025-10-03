package tn.esprit.examen.nomPrenomClasseExamen.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ProcessDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ObjectiveRepo;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.OperationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProcessServices implements IProcessServices {

    private final ProcessRepository processRepository;
    private final OperationRepository operationRepository;
    private final ObjectiveRepo objectiveRepo;
    private final UserEntityRepository userEntityRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuditService auditService;
    @Transactional
    @Override
    public Process addProcess(Process process) {
        if (process.getPilote() != null && process.getPilote().getId() != null) {
            UserEntity pilote = userEntityRepository.findById(process.getPilote().getId())
                    .orElseThrow(() -> new IllegalArgumentException("UserEntity with ID " + process.getPilote().getId() + " does not exist."));
            process.setPilote(pilote);
        }

        if (process.getObjectives() != null && !process.getObjectives().isEmpty()) {
            Set<Objective> objectives = new HashSet<>();
            for (Objective obj : process.getObjectives()) {
                if (obj.getIdObjective() != null) {
                    Objective existingObjective = objectiveRepo.findById(obj.getIdObjective())
                            .orElseThrow(() -> new RuntimeException("Objective not found with ID: " + obj.getIdObjective()));
                    existingObjective.setProcess(process);
                    objectives.add(existingObjective);
                }
            }
            process.setObjectives(objectives);
        }

        if (process.getCreationDate() == null) {
            process.setCreationDate(LocalDate.now());
        }
        process.setFinishDate(process.getFinishDate());

        Process savedProcess = processRepository.save(process);
        if (savedProcess.getObjectives() != null) {
            for (Objective obj : savedProcess.getObjectives()) {
                obj.setProcess(savedProcess);
                objectiveRepo.save(obj);
            }
        }
        log.info("Process added successfully with ID: {}", savedProcess.getId());
        return savedProcess;
    }

    @Transactional
    @Override
    public Process updateProcess(Long id, Process process) {
        Process existingProcess = processRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Process with ID " + id + " does not exist."));

        existingProcess.setProcName(process.getProcName());
        existingProcess.setModifDate(LocalDate.now());
        existingProcess.setDescription(process.getDescription());
        existingProcess.setX(process.getX());
        existingProcess.setY(process.getY());
        existingProcess.setObjectives(process.getObjectives());
        existingProcess.setOperations(process.getOperations());
        existingProcess.setCreationDate(process.getCreationDate());
        existingProcess.setFinishDate(process.getFinishDate());

        if (process.getPilote() != null && process.getPilote().getId() != null) {
            UserEntity pilote = userEntityRepository.findById(process.getPilote().getId())
                    .orElseThrow(() -> new IllegalArgumentException("UserEntity with ID " + process.getPilote().getId() + " does not exist."));
            existingProcess.setPilote(pilote);
        } else {
            existingProcess.setPilote(null);
        }

        Process savedProcess = processRepository.save(existingProcess);
        log.info("Process updated successfully with ID: {}", savedProcess.getId());
        return savedProcess;
    }

    @Override
    public void deleteProcess(Long id) {
        Process process = processRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Process with ID " + id + " does not exist."));

        if (process.getWorkflow() != null) {
            process.getWorkflow().getProcesses().remove(process);
            process.setWorkflow(null);
        }

        if (process.getObjectives() != null) {
            for (Objective objective : process.getObjectives()) {
                objective.setProcess(null);
            }
            process.getObjectives().clear();
        }

        processRepository.delete(process);
        log.info("Process deleted successfully with ID: {}", id);
    }

    @Override
    public Process getProcessById(Long id) {
        Process process = processRepository.findByIdWithPilote(id);
        if (process == null) {
            throw new IllegalArgumentException("Process with ID " + id + " does not exist.");
        }
        return process;
    }

    @Override
    public List<ProcessDTO> getAllProcesses() {
        List<Process> processes = processRepository.findAll();
        return processes.stream().map(process -> {
            ProcessDTO dto = new ProcessDTO();
            dto.setId(process.getId());
            dto.setProcName(process.getProcName());
            dto.setCreationDate(process.getCreationDate());
            dto.setModifDate(process.getModifDate());
            dto.setFinishDate(process.getFinishDate());
            dto.setDescription(process.getDescription());
            dto.setX(process.getX());
            dto.setY(process.getY());
            if (process.getPilote() != null) {
                dto.setPiloteName(process.getPilote().getUsername());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void assignOperationToProcess(Long processId, Long operationId) {
        Process process = processRepository.findById(processId)
                .orElseThrow(() -> new IllegalArgumentException("Process with ID " + processId + " does not exist."));
        Operation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + operationId + " does not exist."));

        if (operation.getProcess() != null) {
            Process oldProcess = operation.getProcess();
            oldProcess.getOperations().remove(operation);
            processRepository.save(oldProcess);
        }

        operation.setProcess(process);
        process.getOperations().add(operation);

        operationRepository.save(operation);
        processRepository.save(process);

        // Envoyer une notification si plus de 3 opérations
        if (process.getOperations().size() > 3) {
            String message = String.format("Process %s has been assigned more than 3 operations.", process.getProcName());
            messagingTemplate.convertAndSend("/room/notifications", message);
            log.info("Notification sent: {}", message);
        }

        // Créer un audit et envoyer une notification si plus de 5 opérations
        if (process.getOperations().size() > 5) {
            Audit audit = new Audit();
            audit.setTitle("Audit interne pour le processus " + process.getProcName());
            audit.setDescription("Le processus a été assigné à plus de 5 opérations.");
            audit.setStartDate(LocalDate.now());
            audit.setEndDate(LocalDate.now().plusDays(7)); // Audit d'une semaine
            audit.setProcess(process);
            auditService.createAudit(audit);

            // Envoyer une notification WebSocket pour la création de l'audit
            String auditMessage = String.format("Audit créé pour le processus %s avec plus de 5 opérations.", process.getProcName());
            messagingTemplate.convertAndSend("/room/notifications", auditMessage);
            log.info("Audit créé et notification envoyée : {}", auditMessage);
        }

        log.info("Operation {} assigned to Process {}", operationId, processId);
    }
    @Transactional
    public void assignObjectiveToProcess(Long processId, Long objectiveId) {
        if (processId == null || objectiveId == null) {
            log.error("Entrée invalide : processId ou objectiveId est null");
            throw new IllegalArgumentException("L'ID du processus et l'ID de l'objectif ne doivent pas être nuls");
        }
        Process process = processRepository.findById(processId)
                .orElseThrow(() -> {
                    log.error("Processus avec l'ID {} n'existe pas", processId);
                    return new IllegalArgumentException("Processus avec l'ID " + processId + " n'existe pas");
                });
        Objective objective = objectiveRepo.findById(objectiveId)
                .orElseThrow(() -> {
                    log.error("Objectif avec l'ID {} n'existe pas", objectiveId);
                    return new IllegalArgumentException("Objectif avec l'ID " + objectiveId + " n'existe pas");
                });
        if (process.getObjectives() == null) {
            process.setObjectives(new HashSet<>());
        }
        if (objective.getProcess() != null && !objective.getProcess().getId().equals(processId)) {
            objective.getProcess().getObjectives().remove(objective);
        }
        objective.setProcess(process);
        process.getObjectives().add(objective);
        objectiveRepo.save(objective);
        processRepository.save(process);

        log.info("Objectif {} assigné au processus {}", objectiveId, processId);
    }
    @Override
    public long getTotalProcesses() {
        long total = processRepository.count();
        log.info("Total processes: {}", total);
        return total;
    }

    @Override
    public double getAverageOperationsPerProcess() {
        List<Process> processes = processRepository.findAll();
        if (processes.isEmpty()) {
            return 0.0;
        }
        double average = processes.stream()
                .mapToInt(process -> process.getOperations() != null ? process.getOperations().size() : 0)
                .average()
                .orElse(0.0);
        log.info("Average operations per process: {}", average);
        return average;
    }

    @Override
    public double getAverageProcessDuration() {
        List<Process> processes = processRepository.findAll();
        if (processes.isEmpty()) {
            return 0.0;
        }
        double averageDuration = processes.stream()
                .filter(p -> p.getCreationDate() != null && p.getFinishDate() != null)
                .mapToLong(p -> ChronoUnit.DAYS.between(p.getCreationDate(), p.getFinishDate()))
                .average()
                .orElse(0.0);
        log.info("Average process duration (days): {}", averageDuration);
        return averageDuration;
    }

    @Override
    public double getCompletionRate() {
        List<Process> processes = processRepository.findAll();
        if (processes.isEmpty()) {
            return 0.0;
        }
        long completed = processes.stream()
                .filter(p -> p.getFinishDate() != null)
                .count();
        double completionRate = (double) completed / processes.size() * 100;
        log.info("Completion rate: {}%", completionRate);
        return completionRate;
    }

    @Override
    public Map<String, Long> getProcessesByPilote() {
        List<Process> processes = processRepository.findAll();
        Map<String, Long> processesByPilote = processes.stream()
                .filter(p -> p.getPilote() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getPilote().getUsername(),
                        Collectors.counting()
                ));
        log.info("Processes by pilote: {}", processesByPilote);
        return processesByPilote;
    }

    @Override
    public double getOperationsDurationCorrelation() {
        List<Process> processes = processRepository.findAll();
        if (processes.size() < 2 || processes.stream().noneMatch(p -> p.getFinishDate() != null && p.getOperations() != null)) {
            log.warn("Not enough data to calculate correlation");
            return 0.0;
        }

        double[] operations = processes.stream()
                .filter(p -> p.getOperations() != null)
                .mapToDouble(p -> p.getOperations().size())
                .toArray();
        double[] durations = processes.stream()
                .filter(p -> p.getCreationDate() != null && p.getFinishDate() != null)
                .mapToDouble(p -> ChronoUnit.DAYS.between(p.getCreationDate(), p.getFinishDate()))
                .toArray();

        if (operations.length != durations.length) {
            log.warn("Mismatch in data arrays for correlation calculation");
            return 0.0;
        }

        double meanOperations = java.util.Arrays.stream(operations).average().orElse(0.0);
        double meanDuration = java.util.Arrays.stream(durations).average().orElse(0.0);

        double numerator = 0.0;
        double denominatorX = 0.0;
        double denominatorY = 0.0;

        for (int i = 0; i < operations.length; i++) {
            double diffX = operations[i] - meanOperations;
            double diffY = durations[i] - meanDuration;
            numerator += diffX * diffY;
            denominatorX += diffX * diffX;
            denominatorY += diffY * diffY;
        }

        double correlation = numerator / Math.sqrt(denominatorX * denominatorY);
        log.info("Operations-Duration Correlation: {}", correlation);
        return Double.isNaN(correlation) ? 0.0 : correlation;
    }
}