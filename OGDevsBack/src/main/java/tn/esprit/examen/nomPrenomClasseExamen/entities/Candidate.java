package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String firstName;
    String lastName;
    String email;
    @Lob
    String resume; // Base64 string for PDF
    String gender;

    @ManyToMany
    @JoinTable(
            name = "candidate_job_offer",
            joinColumns = @JoinColumn(name = "candidate_id"),
            inverseJoinColumns = @JoinColumn(name = "job_offer_id")
    )
    @JsonIgnore
    Set<JobOffer> jobOffers = new HashSet<>();

    @ManyToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    Interview interview;

    String status = "Pending";
    LocalDateTime applicationDate = LocalDateTime.now();
    LocalDateTime acceptDate;

    @Column
    Double score = 0.0; // Nouveau champ pour le score

    @Override
    public String toString() {
        return "Candidate{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", resume(length)=" + (resume != null ? resume.length() : "null") +
                ", gender='" + gender + '\'' +
                ", status='" + status + '\'' +
                ", applicationDate=" + applicationDate +
                ", acceptDate=" + acceptDate +
                ", score=" + score +
                '}';
    }
}