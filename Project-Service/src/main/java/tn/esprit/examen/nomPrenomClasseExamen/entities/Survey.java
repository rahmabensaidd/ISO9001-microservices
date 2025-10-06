package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "surveys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Survey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SurveyType type; // PROJECT, MEETING, TICKET, CONTRACT

    @Column(columnDefinition = "TEXT")
    String questions; // JSON: [{"id": 1, "text": "How clear...", "type": "scale"}]

    @Column(columnDefinition = "TEXT")
    String responses; // JSON: [{"questionId": 1, "answer": "4"}]

    @Column(columnDefinition = "TEXT")
    String questionStats; // JSON: [{"questionId": 1, "averageScore": 4.2}]

    Double score; // Moyenne des réponses (ex. 4.0)

    LocalDateTime responseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SurveyStatus status; // SUBMITTED, REVIEWED

    @Column(columnDefinition = "TEXT")
    String feedback; // Commentaire textuel optionnel

    @Column
    String sentiment; // POSITIVE, NEGATIVE, NEUTRAL

    @ManyToOne
    @JoinColumn(name = "contract_client_id")
    ContractClient contractClient;

    @ManyToOne
    @JoinColumn(name = "project_id")
    Project project;

    @ManyToOne
    @JoinColumn(name = "meeting_id")
    Meeting meeting;

    @ManyToOne
    @JoinColumn(name = "ticket_id")
    Ticket ticket;

    @ManyToOne
    @JoinColumn(name = "filled_by", nullable = false)
    UserEntity filledBy; // Client connecté

    public enum SurveyType {
        PROJECT,
        MEETING,
        TICKET,
        CONTRACT
    }

    public enum SurveyStatus {
        SUBMITTED,
        REVIEWED
    }
}