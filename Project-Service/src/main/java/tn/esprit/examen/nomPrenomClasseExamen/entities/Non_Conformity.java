// src/main/java/tn/esprit/examen/nomPrenomClasseExamen/entities/Non_Conformity.java
package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "non_conformity")
public class Non_Conformity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idNonConformity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NonConformitySource source;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateCreated;

    @Enumerated(EnumType.STRING)
    private NonConformityType type;

    private String status = "OPEN";

    @Column(columnDefinition = "TEXT")
    private String actionTaken;

    private LocalDate fixDate;

    @ManyToOne
    @JsonBackReference("user-detectedBy")
    private UserEntity detectedBy;

    @Column(name = "date_detected")
    private LocalDate dateDetected;

    @ManyToOne
    @JsonBackReference("user-fixedBy")
    private UserEntity fixedBy;

    @Column(name = "is_effective")
    private Boolean isEffective;

    @ElementCollection
    @CollectionTable(name = "non_conformity_attachments", joinColumns = @JoinColumn(name = "non_conformity_id"))
    @Column(name = "attachment")
    private List<String> attachments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "non_conformity_ai_suggestions", joinColumns = @JoinColumn(name = "non_conformity_id"))
    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private List<String> aiSuggestions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "non_conformity_selected_proposals", joinColumns = @JoinColumn(name = "non_conformity_id"))
    @Column(name = "selected_proposal", columnDefinition = "TEXT")
    private List<String> selectedProposals = new ArrayList<>();

    @ManyToOne
    @JsonBackReference("indicator-nonConformities")
    private Indicator indicator;
}