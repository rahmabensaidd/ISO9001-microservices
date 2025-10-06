package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "document")
public class Document implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateCreation;
    private String title;
    @Column(columnDefinition = "TEXT") // Permet de stocker des phrases longues
    private String content;

    @Enumerated(EnumType.STRING)
    private TypeDocument type; // Type de document

    // Champs spécifiques pour Fiche de Paie
    private String employe;          // Fiche de Paie
    private String poste;            // Fiche de Paie
    private Double salaireBrut;      // Fiche de Paie
    private Double salaireNet;       // Fiche de Paie
    private Double cotisationsSociales; // Fiche de Paie
    private String periode;          // Fiche de Paie

    // Champs spécifiques pour Fiche de Poste
    private String objectifs;        // Fiche de Poste
    private String polyvalence;      // Fiche de Poste
    private String experiences;      // Fiche de Poste
    private String formation;        // Fiche de Poste
    private String exigenceDePoste;  // Fiche de Poste
    @ElementCollection
    @CollectionTable(name = "document_taches", joinColumns = @JoinColumn(name = "document_id"))
    private List<String> taches;     // Fiche de Poste
    private String codeProcessus;    // Fiche de Poste

    // Champs spécifiques pour Contrat
    private String typeContrat;      // Contrat (CDD, CDI, Stage, etc.)
    private LocalDate dateDebut;     // Contrat
    private LocalDate dateFin;       // Contrat
    private Double salaire;          // Contrat
    private String category = "Files"; // Default to "Files"

    // Champs spécifiques pour Processus de Réalisation Technique
    private String designation;      // Processus de Réalisation Technique
    private String axe;              // Processus de Réalisation Technique
    private String pilote;           // Processus de Réalisation Technique
    @ElementCollection
    @CollectionTable(name = "document_operations", joinColumns = @JoinColumn(name = "document_id"))
    private List<String> operations; // Processus de Réalisation Technique
    @ElementCollection
    @CollectionTable(name = "document_predecesseurs", joinColumns = @JoinColumn(name = "document_id"))
    private List<String> predecesseurs; // Processus de Réalisation Technique
    @ElementCollection
    @CollectionTable(name = "document_successeurs", joinColumns = @JoinColumn(name = "document_id"))
    private List<String> successeurs; // Processus de Réalisation Technique

    @ManyToOne(optional = true)
    @JoinColumn(name = "created_by_id", nullable = true)
    private UserEntity createdBy;
}
