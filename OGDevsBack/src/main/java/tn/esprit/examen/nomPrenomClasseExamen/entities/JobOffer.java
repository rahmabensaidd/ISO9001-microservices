package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class JobOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;

    @Lob
    String description;

    String location;

    String requirements;

    @Enumerated(EnumType.STRING)
    ContractType contractType;

    Double salary;

    @Lob
    String skillsAndExpertise;

    @Enumerated(EnumType.STRING)
    WorkType workType;

    @ManyToMany(mappedBy = "jobOffers")
    @JsonIgnore
    Set<Candidate> candidates = new HashSet<>();

    @Override
    public String toString() {
        return "JobOffer{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", location='" + location + '\'' +
                ", requirements='" + requirements + '\'' +
                ", contractType=" + contractType +
                ", salary=" + salary +
                ", skillsAndExpertise='" + skillsAndExpertise + '\'' +
                ", workType=" + workType +
                '}';
    }
}

// Énumération pour le type de contrat
enum ContractType {
    CDI, CDD, CVP, FREELANCE, INTERIM
}

// Énumération pour le type de travail
enum WorkType {
    PRESENTIAL, REMOTE, HYBRID
}