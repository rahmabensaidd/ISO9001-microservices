package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Axe;
import java.util.List;

@Data
@Getter
@Setter
public class ObjectiveDTO {
    private Long idObjective;
    private String title;
    private Axe axe;
    private Long processId;
    private String processName;
    private List<String> indicatorNames;
}