package tn.esprit.examen.nomPrenomClasseExamen.entities;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Poste implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String mission;
    float salaire;

    @OneToOne(mappedBy = "poste", fetch = FetchType.EAGER)
    UserEntity userEntity;
}