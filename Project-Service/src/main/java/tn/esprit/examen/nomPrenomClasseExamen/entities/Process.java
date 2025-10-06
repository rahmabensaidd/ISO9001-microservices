package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Process implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    Long id;

    @Column(unique = true, nullable = false)
    String procName;

    @Column
    LocalDate creationDate;

    @Column
    LocalDate modifDate;

    @Column
    LocalDate finishDate;

    @Column
    String description;

    @Column
    int x;

    @Column
    int y;

    @ManyToOne
    @JoinColumn(name = "pilote_id")
    UserEntity pilote;

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    Set<Objective> objectives = new HashSet<>();

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    Set<Operation> operations = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "workflow_id")
    @JsonBackReference
    WorkFlow workflow;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "axe_ocr_id")
    Axe_OCR axe;

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    Set<RiskOpportunity> risksOpportunities = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "process_predecessors",
            joinColumns = @JoinColumn(name = "process_id"),
            inverseJoinColumns = @JoinColumn(name = "predecessor_id")
    )
    Set<PredecessorSuccessor> predecessors = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "process_successors",
            joinColumns = @JoinColumn(name = "process_id"),
            inverseJoinColumns = @JoinColumn(name = "successor_id")
    )
    Set<PredecessorSuccessor> successors = new HashSet<>();
}
