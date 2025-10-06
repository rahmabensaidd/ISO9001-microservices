package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Data
public class TaskDTO {
    private Long id;
    private String taskDescription;
    private String taskStatus;
    private LocalDate creationDate;
    private LocalDate finishDate;
    private Long operationId;
    private String operationName;
    private List<String> assignedUsers;
}