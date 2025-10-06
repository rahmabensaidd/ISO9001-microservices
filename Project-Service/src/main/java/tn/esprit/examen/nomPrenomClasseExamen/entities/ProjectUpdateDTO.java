package tn.esprit.examen.nomPrenomClasseExamen.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectUpdateDTO {
    String name;
    String description;
    LocalDate start_Date;
    LocalDate expected_endDate;
    List<String> requirements;
    List<String> technologies;
    Long clientId; // <-- On remplace l'objet client par juste son ID
}
