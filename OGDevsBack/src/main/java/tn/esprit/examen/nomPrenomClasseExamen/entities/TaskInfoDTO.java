package tn.esprit.examen.nomPrenomClasseExamen.entities;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO pour retourner les infos d'une tâche.
 */
@Data
public class TaskInfoDTO {
    private String projectName;
    private String operationName;
    private LocalDate deadline;
    private String phaseName;

    public TaskInfoDTO(String projectName, String operationName, LocalDate deadline, String phaseName) {
        this.projectName = projectName;
        this.operationName = operationName;
        this.deadline = deadline;
        this.phaseName = phaseName;
    }
}
