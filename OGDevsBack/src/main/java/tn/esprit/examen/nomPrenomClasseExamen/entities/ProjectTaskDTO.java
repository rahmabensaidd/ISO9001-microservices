package tn.esprit.examen.nomPrenomClasseExamen.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectTaskDTO {

    @JsonProperty("id") // Pour garantir que le nom dans le JSON est 'id' si nécessaire
    private Long id;

    @JsonProperty("taskDescription")
    private String taskDescription;

    @JsonProperty("status")
    private String status = "To Do";

    @JsonProperty("sectionId")
    private String sectionId = "501";

    @JsonProperty("bugs")  // Ajout de la liste des bugs
    private Set<BugDTO> bugs;  // Liste des Bugs associés à la tâche du projet

    // Constructeur avec tous les champs
    public ProjectTaskDTO(Long id, String taskDescription, String status, String sectionId, Set<BugDTO> bugs) {
        this.id = id;
        this.taskDescription = taskDescription;
        this.status = status;
        this.sectionId = sectionId;
        this.bugs = bugs != null ? bugs : new HashSet<>(); // Éviter null, initialiser avec un Set vide
    }

    // Si vous devez convertir à partir d'une entité ProjectTask
    public ProjectTaskDTO(ProjectTask projectTask) {
        this.id = projectTask.getId();
        this.taskDescription = projectTask.getTaskDescription();
        this.status = projectTask.getStatus();
        this.sectionId = projectTask.getSectionId();
        // Convertir les bugs en BugDTO
        this.bugs = projectTask.getBugs() != null ?
                projectTask.getBugs().stream()
                        .map(bug -> new BugDTO(bug)) // Assurez-vous que BugDTO possède un constructeur adapté
                        .collect(Collectors.toSet())
                : new HashSet<>();
    }


}
