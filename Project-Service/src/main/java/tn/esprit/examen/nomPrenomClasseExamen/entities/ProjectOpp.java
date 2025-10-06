package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class ProjectOpp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProjectOperation;
    private String name;
    private String description;
    private String priority ;
    private LocalDate deadline;
    private String status = "To Do";  // Valeur par défaut
    private Long progress = 0L;       // Valeur par défaut
    @ManyToOne(fetch = FetchType.EAGER)
    UserEntity user;
    private Long idoperation;
    @OneToMany(mappedBy = "projectOpp")
    Set<ProjectTask> projecttasks = new HashSet<>();

}
