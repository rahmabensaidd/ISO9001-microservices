package tn.esprit.examen.nomPrenomClasseExamen.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Phase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPhase;
    private String phase_name;
    private String description;
    @JsonIgnore
    @ManyToOne
    Project project;

    @OneToOne
    Milestone milestone;
    @OneToMany
    Set<ProjectOpp>projectOperations;
}
