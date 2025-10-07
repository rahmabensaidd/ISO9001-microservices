package com.esprit.microservices.recrutement.entities;
import com.esprit.microservices.recrutement.entities.Training;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idEvaluation;

    private LocalDate evalution_date;
    private double performanceScore;
    private String comment ;
    private String trainingName; // Doit être présent et correctement nommé
    @ManyToOne
    Training training;
}
