package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
@Data
@Getter
@Setter
public class OperationDTO {
    private Long id;
    private String operationName;
    private String operationDescription;
    private LocalDate creationDate;
    private LocalDate finishDate;
    private Long processId;
    private String processName;
    private List<String> taskNames;
    private List<String> assignedUsers;
}