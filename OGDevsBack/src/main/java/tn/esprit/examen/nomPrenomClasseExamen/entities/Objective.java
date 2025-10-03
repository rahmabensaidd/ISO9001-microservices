package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Objective implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    Long idObjective;

    @NotBlank(message = "Title is required")
    String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "axe")
    Axe axe;

    @Column
    String description; // Added to store raw descriptions

    @ManyToOne
    @JsonBackReference
    Process process;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<Indicator> indicators;
}
