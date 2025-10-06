package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String content;

    @Column(name = "date_creation", nullable = false)
    private Date dateCreation;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private String impactLevel;

    @Column(nullable = false)
    private String statut;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "report_id")
    private List<Indicator> indicators;

    private Double performanceScore;

    private Double tauxConformite;

    @Column(columnDefinition = "TEXT") // Augmenter la capacité de la colonne tendances
    private String tendances;
}
