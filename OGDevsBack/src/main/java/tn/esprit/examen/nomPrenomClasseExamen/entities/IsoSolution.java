package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "iso_solutions")
public class IsoSolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "non_conformity_type", nullable = false)
    private NonConformityType nonConformityType;

    @Column(name = "clause", nullable = false)
    private String clause;

    @Column(name = "solution", nullable = false)
    private String solution;
}
