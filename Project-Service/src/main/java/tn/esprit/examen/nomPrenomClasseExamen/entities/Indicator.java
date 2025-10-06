package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Indicator implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIndicateur;

    @NotBlank(message = "Code cannot be blank")
    @Column(nullable = false, unique = true)
    private String code;

    @NotBlank(message = "Libelle cannot be blank")
    @Column(nullable = false)
    private String libelle;

    private String methodeCalcul;

    @NotBlank(message = "Frequence cannot be blank")
    @Column(nullable = false)
    private String frequence;

    @NotBlank(message = "Unite cannot be blank")
    @Column(nullable = false)
    private String unite;

    private Double cible;

    private Double currentValue;

    @NotBlank(message = "Actif cannot be blank")
    @Column(nullable = false)
    private String actif;

    @ManyToOne
    @JsonBackReference
    Objective objective;

    @OneToMany(mappedBy = "indicator")
    @JsonManagedReference("indicator-nonConformities")
    private List<Non_Conformity> nonConformities;

    @ManyToOne
    private Report rapport;
}
