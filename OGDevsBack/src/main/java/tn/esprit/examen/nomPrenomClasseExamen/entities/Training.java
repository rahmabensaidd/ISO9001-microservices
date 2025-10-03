package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Training {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long trainingId;
    private String trainingName;
    private LocalDate scheduledDate;
    private int duration;
    private int completionRate;

    @ManyToMany
    @JsonIgnore // Ignore cette relation pour éviter la sérialisation
    private Set<UserEntity> trainedEmployees;

    @ManyToOne
    @JsonIgnore // Ignore cette relation pour éviter la sérialisation
    private UserEntity Responsable_RH;

    @OneToMany(mappedBy = "training")
    @JsonIgnore // Ignore cette relation pour éviter la sérialisation
    private Set<Evaluation> evaluations;
}