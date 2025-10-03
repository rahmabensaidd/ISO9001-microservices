package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.SearchResultDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.OperationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.TaskRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService implements ISearchService {

    private final ProcessRepository processRepository;
    private final OperationRepository operationRepository;
    private final TaskRepository taskRepository;

    @Override
    public List<SearchResultDTO> searchAll(String query) {
        List<SearchResultDTO> results = new ArrayList<>();

        // Search Processes
        List<Process> processes = processRepository.findByProcNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query);
        results.addAll(processes.stream().map(process -> {
            SearchResultDTO dto = new SearchResultDTO();
            dto.setEntityType("Process");
            dto.setId(process.getId());
            dto.setDisplayName(process.getProcName());
            dto.setDescription(process.getDescription());
            if (process.getPilote() != null) {
                dto.setPiloteName(process.getPilote().getUsername());
            }
            return dto;
        }).collect(Collectors.toList()));

        // Search Operations
        List<Operation> operations = operationRepository.findByOperationNameContainingIgnoreCaseOrOperationDescriptionContainingIgnoreCase(query);
        results.addAll(operations.stream().map(operation -> {
            SearchResultDTO dto = new SearchResultDTO();
            dto.setEntityType("Operation");
            dto.setId(operation.getId());
            dto.setDisplayName(operation.getOperationName());
            dto.setDescription(operation.getOperationDescription());
            if (operation.getProcess() != null) {
                dto.setProcessName(operation.getProcess().getProcName());
            }
            dto.setTaskNames(operation.getTasks().stream()
                    .map(Task::getTaskDescription)
                    .collect(Collectors.toList()));
            dto.setAssignedUsers(operation.getUserEntities().stream()
                    .map(user -> user.getUsername())
                    .collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList()));

        // Search Tasks
        List<Task> tasks = taskRepository.findByTaskDescriptionContainingIgnoreCaseOrTaskStatusContainingIgnoreCase(query);
        results.addAll(tasks.stream().map(task -> {
            SearchResultDTO dto = new SearchResultDTO();
            dto.setEntityType("Task");
            dto.setId(task.getId());
            dto.setDisplayName(task.getTaskDescription());
            dto.setDescription(task.getTaskStatus());
            if (task.getOperation() != null) {
                dto.setProcessName(task.getOperation().getOperationName());
            }
            // Add assignedUsers for Task if you implement user assignments for Task
            return dto;
        }).collect(Collectors.toList()));

        return results;
    }
}