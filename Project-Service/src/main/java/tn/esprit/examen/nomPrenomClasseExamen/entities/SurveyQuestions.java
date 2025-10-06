package tn.esprit.examen.nomPrenomClasseExamen.entities;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SurveyQuestions {

    public static class Question {
        private final Long id;
        private final String text;
        private final String type;

        public Question(Long id, String text, String type) {
            this.id = id;
            this.text = text;
            this.type = type;
        }

        public Long getId() { return id; }
        public String getText() { return text; }
        public String getType() { return type; }
    }

    public static final List<Question> MEETING_QUESTIONS = Arrays.asList(
            new Question(1L, "How clear was the communication during the meeting?", "scale"),
            new Question(2L, "How useful was the meeting in addressing your concerns?", "scale"),
            new Question(3L, "How satisfied are you with the meeting duration?", "scale"),
            new Question(13L, "How engaged were the participants during the meeting?", "scale"),
            new Question(14L, "How well were action items assigned and clarified?", "scale"),
            new Question(15L, "Please provide any additional feedback about the meeting.", "text")
    );

    public static final List<Question> PROJECT_QUESTIONS = Arrays.asList(
            new Question(4L, "How satisfied are you with the project delivery quality?", "scale"),
            new Question(5L, "How well did the project meet your expectations?", "scale"),
            new Question(6L, "How satisfied are you with the project timeline adherence?", "scale"),
            new Question(16L, "How effective was the collaboration with the project team?", "scale"),
            new Question(17L, "How satisfied are you with the project documentation provided?", "scale"),
            new Question(18L, "Please describe any challenges faced during the project.", "text")
    );

    public static final List<Question> TICKET_QUESTIONS = Arrays.asList(
            new Question(7L, "How satisfied are you with the speed of ticket resolution?", "scale"),
            new Question(8L, "How effective was the solution provided for the ticket?", "scale"),
            new Question(9L, "How clear was the communication during ticket resolution?", "scale"),
            new Question(19L, "How satisfied are you with the support team's responsiveness?", "scale"),
            new Question(20L, "How well was the issue explained to you?", "scale"),
            new Question(21L, "Please provide suggestions to improve ticket handling.", "text")
    );

    public static final List<Question> CONTRACT_QUESTIONS = Arrays.asList(
            new Question(10L, "How clear are the terms of the contract?", "scale"),
            new Question(11L, "How satisfied are you with the contract's value for money?", "scale"),
            new Question(12L, "How well does the contract meet your business needs?", "scale"),
            new Question(22L, "How satisfied are you with the contract negotiation process?", "scale"),
            new Question(23L, "How confident are you in the contract's long-term benefits?", "scale"),
            new Question(24L, "Please share any concerns or suggestions about the contract.", "text")
    );

    public static Map<String, List<Question>> QUESTIONS_BY_TYPE = Map.of(
            "MEETING", MEETING_QUESTIONS,
            "PROJECT", PROJECT_QUESTIONS,
            "TICKET", TICKET_QUESTIONS,
            "CONTRACT", CONTRACT_QUESTIONS
    );

    public static List<Question> getQuestionsByType(String type) {
        return QUESTIONS_BY_TYPE.getOrDefault(type, List.of());
    }
}