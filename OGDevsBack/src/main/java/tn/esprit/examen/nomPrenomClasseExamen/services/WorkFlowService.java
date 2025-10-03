package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.WorkFlow;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IWorkFlOW;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.OperationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.TaskRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkFlowService implements IWorkFlowService {

    private final IWorkFlOW workFlowRepository;
    private final ProcessRepository processRepository;
    private final OperationRepository operationRepository;
    private final TaskRepository taskRepository;

    @Override
    public WorkFlow saveWorkFlow(WorkFlow workFlow) {
        if (workFlow == null) {
            log.error("Cannot save null WorkFlow");
            throw new IllegalArgumentException("WorkFlow cannot be null");
        }

        log.info("Saving Workflow with name: {}, processes: {}, paperSnapshot length: {}",
                workFlow.getName(),
                workFlow.getProcesses() != null ? workFlow.getProcesses().size() : 0,
                workFlow.getPaperSnapshot() != null ? workFlow.getPaperSnapshot().length() : 0);

        // Initialize processes list if null
        if (workFlow.getProcesses() == null) {
            workFlow.setProcesses(new ArrayList<>());
            log.warn("Processes list was null, initialized as empty list");
        }

        // Check for existing workflow by name
        Optional<WorkFlow> existingWorkflow = workFlowRepository.findByName(workFlow.getName());
        WorkFlow workflowToSave = existingWorkflow.orElse(workFlow);

        // Update fields if workflow exists
        if (existingWorkflow.isPresent()) {
            workflowToSave.setPaperSnapshot(workFlow.getPaperSnapshot());
            workflowToSave.setPaperState(workFlow.getPaperState());
            workflowToSave.setWorkflowData(workFlow.getWorkflowData());
            log.info("Updating existing workflow with ID: {}", workflowToSave.getId());
        } else {
            // Set default values for new workflow
            if (workflowToSave.getName() == null || workflowToSave.getName().trim().isEmpty()) {
                workflowToSave.setName("Default Workflow");
                log.warn("Workflow name was null or empty, set to default");
            }
            if (workflowToSave.getWorkflowData() == null) {
                workflowToSave.setWorkflowData("");
                log.warn("WorkflowData was null, set to empty string");
            }
        }

        // Handle Processes and their nested Operations and Tasks
        List<Process> processesToSave = new ArrayList<>();
        for (Process process : workFlow.getProcesses()) {
            if (process == null || process.getProcName() == null || process.getProcName().trim().isEmpty()) {
                log.warn("Null or invalid process found, skipping");
                continue;
            }

            // Check for existing process
            Optional<Process> existingProcess = processRepository.findByProcName(process.getProcName());
            Process processToSave = existingProcess.orElse(process);
            processToSave.setWorkflow(workflowToSave);

            // Initialize operations if null
            if (processToSave.getOperations() == null) {
                processToSave.setOperations(new HashSet<>());
            }

            // Handle Operations
            Set<Operation> operationsToSave = new HashSet<>();
            if (process.getOperations() != null) {
                for (Operation operation : process.getOperations()) {
                    if (operation == null || operation.getOperationName() == null || operation.getOperationName().trim().isEmpty()) {
                        log.warn("Null or invalid operation found, skipping");
                        continue;
                    }

                    // Check for existing operation
                    Optional<Operation> existingOperation = operationRepository.findByOperationName(operation.getOperationName());
                    Operation operationToSave = existingOperation.orElse(operation);
                    operationToSave.setProcess(processToSave);

                    // Initialize tasks if null
                    if (operationToSave.getTasks() == null) {
                        operationToSave.setTasks(new HashSet<>());
                    }

                    // Handle Tasks
                    Set<Task> tasksToSave = new HashSet<>();
                    if (operation.getTasks() != null) {
                        for (Task task : operation.getTasks()) {
                            if (task == null || task.getTaskDescription() == null || task.getTaskDescription().trim().isEmpty()) {
                                log.warn("Null or invalid task found, skipping");
                                continue;
                            }

                            // Check for existing task
                            Optional<Task> existingTask = taskRepository.findByTaskDescription(task.getTaskDescription());
                            Task taskToSave = existingTask.orElse(task);
                            taskToSave.setOperation(operationToSave);
                            tasksToSave.add(taskToSave);
                        }
                    }
                    operationToSave.setTasks(tasksToSave);
                    operationsToSave.add(operationToSave);
                }
            }
            processToSave.setOperations(operationsToSave);
            processesToSave.add(processToSave);
        }
        workflowToSave.setProcesses(processesToSave);

        try {
            WorkFlow savedWorkflow = workFlowRepository.save(workflowToSave);
            log.info("Workflow saved with ID: {}", savedWorkflow.getId());
            return savedWorkflow;
        } catch (Exception e) {
            log.error("Failed to save workflow: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save workflow: " + e.getMessage(), e);
        }
    }

    @Override
    public WorkFlow getWorkflowById(Long id) {
        WorkFlow workflow = workFlowRepository.findById(id).orElse(null);
        if (workflow != null) {
            initializeWorkflow(workflow);
            log.info("Retrieved Workflow with ID: {}, paperSnapshot length: {}",
                    workflow.getId(),
                    workflow.getPaperSnapshot() != null ? workflow.getPaperSnapshot().length() : 0);
        } else {
            log.warn("No workflow found with ID: {}", id);
        }
        return workflow;
    }

    @Override
    public WorkFlow getWorkflowByName(String name) {
        Optional<WorkFlow> workflowOpt = workFlowRepository.findByName(name);
        WorkFlow workflow = workflowOpt.orElse(null);
        if (workflow != null) {
            initializeWorkflow(workflow);
            log.info("Retrieved Workflow with name: {}, ID: {}, paperSnapshot length: {}",
                    workflow.getName(),
                    workflow.getId(),
                    workflow.getPaperSnapshot() != null ? workflow.getPaperSnapshot().length() : 0);
        } else {
            log.warn("No workflow found with name: {}", name);
        }
        return workflow;
    }

    @Override
    public List<WorkFlow> getAllWorkflows() {
        log.info("Fetching all Workflows");
        List<WorkFlow> workflows = workFlowRepository.findAll();
        for (WorkFlow workflow : workflows) {
            initializeWorkflow(workflow);
        }
        return workflows;
    }

    @Override
    public String getWorkflowSnapshot(Long id) {
        WorkFlow workflow = workFlowRepository.findById(id).orElse(null);
        if (workflow != null) {
            log.info("Retrieved snapshot for Workflow ID: {}", id);
            return workflow.getPaperSnapshot();
        }
        log.warn("No workflow found with ID: {}", id);
        return null;
    }

    private void initializeWorkflow(WorkFlow workflow) {
        Hibernate.initialize(workflow.getProcesses());
        if (workflow.getProcesses() != null) {
            for (Process process : workflow.getProcesses()) {
                Hibernate.initialize(process.getOperations());
                if (process.getOperations() != null) {
                    for (Operation operation : process.getOperations()) {
                        Hibernate.initialize(operation.getTasks());
                        Hibernate.initialize(operation.getUserEntities());
                    }
                }
                Hibernate.initialize(process.getObjectives());
                Hibernate.initialize(process.getPilote());
            }
        }
    }
}