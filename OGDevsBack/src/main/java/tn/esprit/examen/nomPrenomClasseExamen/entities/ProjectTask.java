package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class ProjectTask implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Ajout de la génération automatique de l'ID
    private Long id;

    private String taskDescription;

    private String status = "To Do";
   private  String sectionId="501";
    @ManyToOne
    ProjectOpp projectOpp;// La relation inverse avec ProjectOpp
    @OneToMany 
    Set<Bug> bugs;

}