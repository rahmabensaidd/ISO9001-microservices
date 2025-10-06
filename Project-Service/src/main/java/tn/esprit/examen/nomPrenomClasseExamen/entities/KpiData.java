package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class KpiData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "indicator_id")
    private Indicator indicator;

    private LocalDate date;

    // Données brutes
    private Double value1; // Ex. : Frais financiers, Budget réalisé, etc.
    private Double value2; // Ex. : CA annuel, Budget prévu, etc.
    private Integer count1; // Ex. : Nombre de NC, Nombre d'heures réalisées, etc.
    private Integer count2; // Ex. : Nombre total, Nombre d'heures prévues, etc.
    private String source; // Ex. : Type de NC (administrative, sécurité, etc.)

    // Valeur calculée (historique)
    private Double calculatedValue;

}
