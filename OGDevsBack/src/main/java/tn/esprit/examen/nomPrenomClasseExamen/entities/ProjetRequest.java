package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "project_request_byclient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjetRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private double budgetProposedByClient; // Corrigé

    @Column(nullable = false)
    private LocalDate desiredStartDate;

    @Column(nullable = false)
    private LocalDate desiredEndDate; // Corrigé

    private Double heuresPrevues;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRequestProjet statut;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private UserEntity client;
}