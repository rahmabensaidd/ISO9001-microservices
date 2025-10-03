package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Getter;
import lombok.Setter;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Survey.SurveyType;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Survey.SurveyStatus;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
public class SurveyDTO {
    private Long id;
    private String title;
    private SurveyType type;
    private String questions; // JSON
    private String responses; // JSON
    private String questionStats; // JSON
    private Double score;
    private String responseDate;
    private SurveyStatus status; // SUBMITTED, REVIEWED
    private String feedback; // Commentaire textuel
    private Long contractClientId;
    private Long projectId;
    private Long meetingId;
    private Long ticketId;
    private String filledById;
    private String filledByUsername;

    @Getter
    @Setter
    public static class SurveyResponse {
        private Long questionId;
        private String answer; // "1" à "5"
    }

    @Getter
    @Setter
    public static class CreateSurveyRequest {
        private String title;
        private SurveyType type; // Type de sondage (PROJECT, MEETING, TICKET, CONTRACT)
        private Long contractClientId; // Optionnel si type != CONTRACT
        private Long projectId; // Optionnel si type != PROJECT
        private Long meetingId; // Optionnel si type != MEETING
        private Long ticketId; // Optionnel si type != TICKET
        private List<SurveyResponse> responses; // Liste des réponses
        private String feedback; // Commentaire textuel optionnel
    }

    // DTO pour les statistiques globales
    @Getter
    @Setter
    public static class SurveyStats {
        private Double averageScore; // Moyenne globale des scores
        private Map<Long, Double> questionAverages; // Moyenne par question
        private Map<String, Integer> scoreDistribution; // Distribution des scores (ex. "1": 5, "2": 3, ...)
    }

    // DTO pour les tendances temporelles
    @Getter
    @Setter
    public static class TrendData {
        private String date; // ex. "2025-05-01"
        private Double averageScore;
    }

    // DTO pour l'analyse avancée
    @Getter
    @Setter
    public static class SatisfactionAnalysis {
        private Double overallSatisfaction; // Satisfaction globale
        private Map<String, Double> satisfactionByType; // Satisfaction par type (ex. CONTRACT, PROJECT)
        private List<TrendData> satisfactionTrends; // Tendances temporelles
        private List<String> alerts; // Alertes (ex. "Satisfaction basse pour CONTRACT")
    }

    // DTO pour la gamification
    @Getter
    @Setter
    public static class GamificationInfo {
        private int points;
        private Set<String> badges;
        private Set<String> rewards;
    }
}