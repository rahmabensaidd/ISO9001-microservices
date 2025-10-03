package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {
    @Id
    private String id;

    @Column(nullable = false)
    private String roleName;

    private String description;
}