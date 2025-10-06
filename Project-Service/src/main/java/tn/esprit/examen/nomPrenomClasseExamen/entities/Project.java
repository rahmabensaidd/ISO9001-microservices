package tn.esprit.examen.nomPrenomClasseExamen.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProjet;
    private String name;
    private String projectType;

    @ElementCollection
    List<String> requirements;

    @ElementCollection
    List<String>technologies;

    @Column(length = 1000)
    private String description;

    private LocalDate start_Date;
    private LocalDate expected_endDate;
    @ManyToOne
    private UserEntity responsable;
    @JsonIgnore
    @ManyToMany
    Set<Process> processes;
    @JsonIgnore
    @OneToMany(mappedBy = "project")
    Set<Phase>phases;
    @OneToMany(mappedBy = "project")
    Set<Resource>resources;
    //added  for Client project relation
    @ManyToOne
    @JoinColumn(name = "client_id")
    private UserEntity client;
    //added to calculate (nombres d'heures realisés pour les indicateurs de client)
    private LocalDate actual_endDate;
    //added to caculate heuresRealisees through start_Date et actual_endDate
    @Column
    private Double heuresRealisees;


}
