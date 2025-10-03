package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class ComplianceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idRecord;
    private String title;
    private String status;
    private LocalDate date;

    @OneToMany(mappedBy = "complianceRecord")
    Set<ISOClause> isoClauses;
}
