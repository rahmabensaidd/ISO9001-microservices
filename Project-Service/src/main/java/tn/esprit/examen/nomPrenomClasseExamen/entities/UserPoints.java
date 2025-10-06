package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_points")
@Getter
@Setter
@NoArgsConstructor
public class UserPoints {

    @Id
    @Column(name = "user_id")
    private String userId;

    private Long points = 0L;

    @ElementCollection
    private Set<String> badges = new HashSet<>();

    @ElementCollection
    private Set<String> rewards = new HashSet<>();

    @OneToOne
    @MapsId
    private UserEntity user;
}