package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Data
@Getter
@Setter
public class ProjectResponseDTO {
    private Long idProjet;
    private String name;
    private String projectType;
    private List<String> requirements;
    private List<String> technologies;
    private String description;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;
    private Double heuresRealisees;

    public ProjectResponseDTO(tn.esprit.examen.nomPrenomClasseExamen.entities.Project project) {
        this.idProjet = project.getIdProjet();
        this.name = project.getName();
        this.projectType = project.getProjectType();
        this.requirements = project.getRequirements();
        this.technologies = project.getTechnologies();
        this.description = project.getDescription();
        this.startDate = project.getStart_Date();
        this.expectedEndDate = project.getExpected_endDate();
        this.actualEndDate = project.getActual_endDate();
        this.heuresRealisees = project.getHeuresRealisees();
    }
}