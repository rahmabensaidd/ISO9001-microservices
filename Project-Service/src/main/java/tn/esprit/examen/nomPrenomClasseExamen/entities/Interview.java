package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long idInterview;
    String name;
    String description;
    LocalDateTime interviewDate; // Changé de LocalDate à LocalDateTime
    @Enumerated(EnumType.STRING)
    InterviewType interviewType;

    @ManyToOne
    @JoinColumn(name = "job_offer_id")
    JobOffer jobOffer;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    Candidate candidate;

    @Override
    public String toString() {
        return "Interview{" +
                "idInterview=" + idInterview +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", interviewDate=" + interviewDate +
                ", interviewType=" + interviewType +
                ", jobOffer=" + (jobOffer != null ? jobOffer.getTitle() : "null") +
                ", candidate=" + (candidate != null ? candidate.getFirstName() + " " + candidate.getLastName() : "null") +
                '}';
    }
}