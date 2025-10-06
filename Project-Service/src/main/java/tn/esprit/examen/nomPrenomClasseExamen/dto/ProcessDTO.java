package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Data
@Getter
@Setter
public class ProcessDTO {
    private Long id;
    private String procName;
    private LocalDate creationDate;
    private LocalDate modifDate;
    private LocalDate finishDate;
    private String description;
    private int x;
    private int y;
    private String piloteName;
}