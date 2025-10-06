package tn.esprit.examen.nomPrenomClasseExamen.entities;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class QMSElement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long elementId;
    private String name;
    private String description;

    @ManyToMany(mappedBy = "qmsElements")
    Set<ISOClause> isoClauses;
}
