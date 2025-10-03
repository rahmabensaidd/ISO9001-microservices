package tn.esprit.examen.nomPrenomClasseExamen.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectDTO {

    Long idProjet;
    String name;
    String projectType;
    String description;
    LocalDate start_Date;
    LocalDate expected_endDate;
    UserDTO responsable;
    Set<PhaseDTO> phases;
    List<String> requirements;
    Set<Resource> resources;
    List<String> technologies;
    UserDTO client;


    // ✅ Constructeur sécurisé pour éviter NullPointerException
    public ProjectDTO(Project project) {
        if (project == null) return;

        this.idProjet = project.getIdProjet();
        this.name = project.getName();
        this.projectType = project.getProjectType();
        this.description = project.getDescription();
        this.start_Date = project.getStart_Date();
        this.expected_endDate = project.getExpected_endDate();

        this.responsable = project.getResponsable() != null ? new UserDTO(project.getResponsable()) : null;
        this.client = project.getClient() != null ? new UserDTO(project.getClient()) : null;

        this.phases = project.getPhases() != null
                ? project.getPhases().stream().map(PhaseDTO::new).collect(Collectors.toSet())
                : Collections.emptySet();

        this.requirements = project.getRequirements() != null
                ? new ArrayList<>(project.getRequirements())
                : Collections.emptyList();

        this.technologies = project.getTechnologies() != null
                ? new ArrayList<>(project.getTechnologies())
                : Collections.emptyList();

        this.resources = project.getResources() != null
                ? new HashSet<>(project.getResources())
                : Collections.emptySet();


    }
}
