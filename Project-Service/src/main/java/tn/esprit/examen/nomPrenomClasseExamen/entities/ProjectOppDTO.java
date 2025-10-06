package tn.esprit.examen.nomPrenomClasseExamen.entities;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class ProjectOppDTO {

    private Long idProjectOperation;
    private String name;
    private String description;
    private String priority;
    private LocalDate deadline;
    private String status;
    private Long progress;
    private UserDTO user;
    private Long idoperation;
    private Set<ProjectTaskDTO> projectTasks = new HashSet<>();

    // Constructeur qui prend un ProjectOpp pour initialiser les champs
    public ProjectOppDTO(ProjectOpp projectOpp) {
        this.idProjectOperation = projectOpp.getIdProjectOperation();
        this.name = projectOpp.getName();
        this.description = projectOpp.getDescription();
        this.priority = projectOpp.getPriority();
        this.deadline = projectOpp.getDeadline();
        this.status = projectOpp.getStatus();
        this.progress = projectOpp.getProgress();
        this.idoperation = projectOpp.getIdoperation();

        // Conversion de l'utilisateur en UserDTO
        this.user = (projectOpp.getUser() != null) ? new UserDTO(projectOpp.getUser()) : null;

        // Conversion de ProjectTask en ProjectTaskDTO
        this.projectTasks = projectOpp.getProjecttasks() != null
                ? projectOpp.getProjecttasks().stream()
                .map(task -> new ProjectTaskDTO(task)) // Utilisation du constructeur adapté
                .collect(Collectors.toSet()) // ✅ Conserve toSet()
                : new HashSet<>(); // ✅ Retourne un Set vide au lieu de null
    }

    // Getters et Setters
    public Long getIdProjectOperation() {
        return idProjectOperation;
    }

    public void setIdProjectOperation(Long idProjectOperation) {
        this.idProjectOperation = idProjectOperation;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProgress() {
        return progress;
    }

    public void setProgress(Long progress) {
        this.progress = progress;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Long getIdoperation() {
        return idoperation;
    }

    public void setIdoperation(Long idoperation) {
        this.idoperation = idoperation;
    }

    public Set<ProjectTaskDTO> getProjectTasks() {
        return projectTasks;
    }

    public void setProjectTasks(Set<ProjectTaskDTO> projectTasks) {
        this.projectTasks = projectTasks;
    }
}
