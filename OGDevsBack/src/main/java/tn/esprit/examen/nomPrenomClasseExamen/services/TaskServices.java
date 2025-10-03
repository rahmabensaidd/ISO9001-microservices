package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.TaskDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Data;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.DataRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.OperationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.TaskRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServices implements ITaskServices {

    private final TaskRepository taskRepository;
    private final OperationRepository operationRepository;
    private final DataRepository dataRepository;

    @Override
    public Task createTask(Task task) {
        if (task.getOperation() != null && task.getOperation().getId() != null) {
            Operation operation = operationRepository.findById(task.getOperation().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + task.getOperation().getId() + " does not exist."));
            task.setOperation(operation);
            operation.getTasks().add(task);
        }

        // Ajout des nouveaux champs
        if (task.getCreationDate() == null) {
            task.setCreationDate(LocalDate.now());
        }
        task.setFinishDate(task.getFinishDate());

        Task savedTask = taskRepository.save(task);
        log.info("Task created successfully with ID: {}", savedTask.getId());
        return savedTask;
    }

    @Override
    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + id + " does not exist."));

        existingTask.setTaskDescription(updatedTask.getTaskDescription());
        existingTask.setTaskStatus(updatedTask.getTaskStatus());
        // Ajout des nouveaux champs
        existingTask.setCreationDate(updatedTask.getCreationDate());
        existingTask.setFinishDate(updatedTask.getFinishDate());

        if (updatedTask.getOperation() != null && updatedTask.getOperation().getId() != null) {
            Operation operation = operationRepository.findById(updatedTask.getOperation().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Operation with ID " + updatedTask.getOperation().getId() + " does not exist."));
            if (existingTask.getOperation() != null && !existingTask.getOperation().getId().equals(operation.getId())) {
                existingTask.getOperation().getTasks().remove(existingTask);
            }
            existingTask.setOperation(operation);
            operation.getTasks().add(existingTask);
        } else {
            if (existingTask.getOperation() != null) {
                existingTask.getOperation().getTasks().remove(existingTask);
                existingTask.setOperation(null);
            }
        }

        Task savedTask = taskRepository.save(existingTask);
        log.info("Task updated successfully with ID: {}", savedTask.getId());
        return savedTask;
    }

    @Override
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findByIdWithOperation(id);
    }

    @Override
    public List<TaskDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream().map(task -> {
            TaskDTO dto = new TaskDTO();
            dto.setId(task.getId());
            dto.setTaskDescription(task.getTaskDescription());
            dto.setTaskStatus(task.getTaskStatus());
            dto.setCreationDate(task.getCreationDate());
            dto.setFinishDate(task.getFinishDate());
            if (task.getOperation() != null) {
                dto.setOperationId(task.getOperation().getId());
                dto.setOperationName(task.getOperation().getOperationName());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + id + " does not exist."));

        if (task.getOperation() != null) {
            task.getOperation().getTasks().remove(task);
            task.setOperation(null);
        }

        taskRepository.delete(task);
        log.info("Task deleted successfully with ID: {}", id);
    }

    @Override
    public Task datasToTask(Long taskId, Set<Long> dataIds) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + taskId + " does not exist."));
        List<Data> dataList = dataRepository.findAllById(dataIds);
        if (dataList.size() != dataIds.size()) {
            throw new IllegalArgumentException("Certains IDs de Data fournis n'existent pas.");
        }
        if (task.getDataSet() == null) {
            task.setDataSet(new HashSet<>());
        }
        task.getDataSet().addAll(dataList);
        Task updatedTask = taskRepository.save(task);
        log.info("Assigned {} Data to Task with ID: {}", dataList.size(), taskId);
        return updatedTask;
    }
    @Override
    public long getTotalTasks() {
        long total = taskRepository.count();
        log.info("Total tasks: {}", total);
        return total;
    }

    @Override
    public double getAverageDataPerTask() {
        List<Task> tasks = taskRepository.findAll();
        if (tasks.isEmpty()) {
            return 0.0;
        }
        double average = tasks.stream()
                .mapToInt(task -> task.getDataSet() != null ? task.getDataSet().size() : 0)
                .average()
                .orElse(0.0);
        log.info("Average data entries per task: {}", average);
        return average;
    }

    @Override
    public double getAverageTaskDuration() {
        List<Task> tasks = taskRepository.findAll();
        if (tasks.isEmpty()) {
            return 0.0;
        }
        double averageDuration = tasks.stream()
                .filter(t -> t.getCreationDate() != null && t.getFinishDate() != null)
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getCreationDate(), t.getFinishDate()))
                .average()
                .orElse(0.0);
        log.info("Average task duration (days): {}", averageDuration);
        return averageDuration;
    }

    @Override
    public double getCompletionRate() {
        List<Task> tasks = taskRepository.findAll();
        if (tasks.isEmpty()) {
            return 0.0;
        }
        long completed = tasks.stream()
                .filter(t -> t.getFinishDate() != null)
                .count();
        double completionRate = (double) completed / tasks.size() * 100;
        log.info("Task completion rate: {}%", completionRate);
        return completionRate;
    }

    @Override
    public Map<String, Long> getTasksByOperation() {
        List<Task> tasks = taskRepository.findAll();
        Map<String, Long> tasksByOperation = tasks.stream()
                .filter(t -> t.getOperation() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getOperation().getOperationName(),
                        Collectors.counting()
                ));
        log.info("Tasks by operation: {}", tasksByOperation);
        return tasksByOperation;
    }

    @Override
    public double getDataDurationCorrelation() {
        List<Task> tasks = taskRepository.findAll();
        if (tasks.size() < 2 || tasks.stream().noneMatch(t -> t.getFinishDate() != null && t.getDataSet() != null)) {
            log.warn("Not enough data to calculate correlation");
            return 0.0;
        }

        double[] dataCounts = tasks.stream()
                .filter(t -> t.getDataSet() != null)
                .mapToDouble(t -> t.getDataSet().size())
                .toArray();
        double[] durations = tasks.stream()
                .filter(t -> t.getCreationDate() != null && t.getFinishDate() != null)
                .mapToDouble(t -> ChronoUnit.DAYS.between(t.getCreationDate(), t.getFinishDate()))
                .toArray();

        if (dataCounts.length != durations.length) {
            log.warn("Mismatch in data arrays for correlation calculation");
            return 0.0;
        }

        double meanData = java.util.Arrays.stream(dataCounts).average().orElse(0.0);
        double meanDuration = java.util.Arrays.stream(durations).average().orElse(0.0);

        double numerator = 0.0;
        double denominatorX = 0.0;
        double denominatorY = 0.0;

        for (int i = 0; i < dataCounts.length; i++) {
            double diffX = dataCounts[i] - meanData;
            double diffY = durations[i] - meanDuration;
            numerator += diffX * diffY;
            denominatorX += diffX * diffX;
            denominatorY += diffY * diffY;
        }

        double correlation = numerator / Math.sqrt(denominatorX * denominatorY);
        log.info("Data-Duration Correlation: {}", correlation);
        return Double.isNaN(correlation) ? 0.0 : correlation;
    }
}