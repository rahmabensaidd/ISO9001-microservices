package tn.esprit.examen.nomPrenomClasseExamen.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.SurveyDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SurveyServiceImpl implements SurveyService {
    private final SurveyRepository surveyRepository;
    private final UserEntityRepository userEntityRepository;
    private final ContractClientRepository contractClientRepository;
    private final ProjectRepository projectRepository;
    private final MeetingRepository meetingRepository;
    private final TicketRepository ticketRepository;
    private final UserPointsRepository userPointsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<SurveyDTO> getSurveysForCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if (userId == null) {
            log.error("Aucun utilisateur connecté trouvé dans le contexte de sécurité");
            throw new RuntimeException("Aucun utilisateur connecté trouvé.");
        }

        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        List<Survey> surveys = surveyRepository.findByFilledById(userId);
        return surveys.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SurveyDTO> getAllSurveys() {
    List<Survey> surveys = surveyRepository.findAll();
    return surveys.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public SurveyDTO createAndSubmitSurvey(SurveyDTO.CreateSurveyRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if (userId == null) {
            log.error("Aucun utilisateur connecté trouvé dans le contexte de sécurité");
            throw new RuntimeException("Aucun utilisateur connecté trouvé.");
        }

        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }
        UserEntity user = userOpt.get();

        Survey survey = new Survey();
        survey.setType(request.getType());
        survey.setTitle(request.getTitle());
        survey.setFilledBy(user);
        survey.setResponseDate(LocalDateTime.now());
        survey.setStatus(Survey.SurveyStatus.SUBMITTED);

        switch (request.getType()) {
            case CONTRACT:
                if (request.getContractClientId() == null) {
                    throw new RuntimeException("L'ID du contrat est requis pour un sondage de type CONTRACT.");
                }
                ContractClient contract = contractClientRepository.findById(request.getContractClientId())
                        .orElseThrow(() -> new RuntimeException("Contrat non trouvé (ID: " + request.getContractClientId() + ")."));
                survey.setContractClient(contract);
                break;
            case PROJECT:
                if (request.getProjectId() == null) {
                    throw new RuntimeException("L'ID du projet est requis pour un sondage de type PROJECT.");
                }
                Project project = projectRepository.findById(request.getProjectId())
                        .orElseThrow(() -> new RuntimeException("Projet non trouvé (ID: " + request.getProjectId() + ")."));
                survey.setProject(project);
                break;
            case MEETING:
                if (request.getMeetingId() == null) {
                    throw new RuntimeException("L'ID de la réunion est requis pour un sondage de type MEETING.");
                }
                Meeting meeting = meetingRepository.findById(request.getMeetingId())
                        .orElseThrow(() -> new RuntimeException("Réunion non trouvée (ID: " + request.getMeetingId() + ")."));
                survey.setMeeting(meeting);
                break;
            case TICKET:
                if (request.getTicketId() == null) {
                    throw new RuntimeException("L'ID du ticket est requis pour un sondage de type TICKET.");
                }
                Ticket ticket = ticketRepository.findById(request.getTicketId())
                        .orElseThrow(() -> new RuntimeException("Ticket non trouvé (ID: " + request.getTicketId() + ")."));
                survey.setTicket(ticket);
                break;
            default:
                throw new RuntimeException("Type de sondage non valide : " + request.getType());
        }

        List<SurveyQuestions.Question> validQuestions = SurveyQuestions.getQuestionsByType(request.getType().name());
        try {
            survey.setQuestions(objectMapper.writeValueAsString(validQuestions));
        } catch (Exception e) {
            log.error("Erreur lors de la sérialisation des questions : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la génération des questions.");
        }

        List<Long> validQuestionIds = validQuestions.stream().map(SurveyQuestions.Question::getId).collect(Collectors.toList());
        for (SurveyDTO.SurveyResponse response : request.getResponses()) {
            if (!validQuestionIds.contains(response.getQuestionId())) {
                log.error("Question non valide : questionId={}", response.getQuestionId());
                throw new RuntimeException("Question non valide (ID: " + response.getQuestionId() + ").");
            }
            if (!response.getAnswer().matches("[1-5]")) {
                log.error("Réponse non valide pour une échelle : answer={}", response.getAnswer());
                throw new RuntimeException("Réponse non valide pour la question (ID: " + response.getQuestionId() + ").");
            }
        }

        try {
            survey.setResponses(objectMapper.writeValueAsString(request.getResponses()));

            double score = request.getResponses().stream()
                    .mapToDouble(r -> Double.parseDouble(r.getAnswer()))
                    .average()
                    .orElse(0.0);
            survey.setScore(score);

            Map<Long, Double> stats = request.getResponses().stream()
                    .collect(Collectors.groupingBy(
                            SurveyDTO.SurveyResponse::getQuestionId,
                            Collectors.averagingDouble(r -> Double.parseDouble(r.getAnswer()))
                    ));
            survey.setQuestionStats(objectMapper.writeValueAsString(stats.entrySet().stream()
                    .map(entry -> Map.of("questionId", entry.getKey(), "averageScore", entry.getValue()))
                    .collect(Collectors.toList())));

            survey.setFeedback(request.getFeedback());

            surveyRepository.save(survey);
            log.info("Sondage créé et soumis : surveyId={}", survey.getId());

            updateGamification(user);

            return mapToDTO(survey);
        } catch (Exception e) {
            log.error("Erreur lors de la création du sondage : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du sondage : " + e.getMessage());
        }
    }

    private void updateGamification(UserEntity user) {
        if (user == null || user.getId() == null) {
            log.error("Utilisateur ou identifiant de l'utilisateur est null : user={}", user);
            throw new RuntimeException("L'utilisateur ou son identifiant ne peut pas être null.");
        }

        UserPoints userPoints = userPointsRepository.findById(user.getId())
                .orElseGet(() -> {
                    UserPoints newUserPoints = new UserPoints();
                    newUserPoints.setUser(user); // Définir l'utilisateur avant sauvegarde
                    return userPointsRepository.save(newUserPoints); // Persistez immédiatement
                });

        userPoints.setPoints(userPoints.getPoints() + 10);

        long surveyCount = surveyRepository.countByFilledById(user.getId());

        Set<String> badges = userPoints.getBadges();
        if (surveyCount >= 1 && !badges.contains("Contributeur Actif")) {
            badges.add("Contributeur Actif");
            log.info("Badge 'Contributeur Actif' attribué à userId={}", user.getId());
        }
        if (surveyCount >= 2 && !badges.contains("Expert Feedback")) {
            badges.add("Expert Feedback");
            log.info("Badge 'Expert Feedback' attribué à userId={}", user.getId());
        }
        userPoints.setBadges(badges);

        Set<String> rewards = userPoints.getRewards();
        if (surveyCount >= 3 && !rewards.contains("Réduction 5%")) {
            rewards.add("Réduction 5%");
            log.info("Récompense 'Réduction 5%' attribuée à userId={}", user.getId());
        }
        userPoints.setRewards(rewards);

        userPointsRepository.save(userPoints);
    }

    @Override
    public SurveyDTO.GamificationInfo getGamificationInfo() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if (userId == null) {
            log.error("Aucun utilisateur connecté trouvé dans le contexte de sécurité");
            throw new RuntimeException("Aucun utilisateur connecté trouvé.");
        }

        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserPoints userPoints = userPointsRepository.findById(userId)
                .orElseGet(() -> {
                    UserPoints newUserPoints = new UserPoints();
                    newUserPoints.setUser(userOpt.get());
                    return userPointsRepository.save(newUserPoints);
                });

        SurveyDTO.GamificationInfo info = new SurveyDTO.GamificationInfo();
        info.setPoints(Math.toIntExact(userPoints.getPoints()));
        info.setBadges(userPoints.getBadges());
        info.setRewards(userPoints.getRewards());
        return info;
    }

    @Override
    public SurveyDTO markSurveyAsReviewed(Long surveyId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if (userId == null) {
            log.error("Aucun utilisateur connecté trouvé dans le contexte de sécurité");
            throw new RuntimeException("Aucun utilisateur connecté trouvé.");
        }

        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }
        UserEntity user = userOpt.get();
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Sondage non trouvé (ID: " + surveyId + ")."));

        if (survey.getStatus() == Survey.SurveyStatus.REVIEWED) {
            log.warn("Sondage déjà examiné : surveyId={}", surveyId);
            return mapToDTO(survey);
        }

        survey.setStatus(Survey.SurveyStatus.REVIEWED);
        surveyRepository.save(survey);
        log.info("Sondage marqué comme examiné : surveyId={}", surveyId);
        return mapToDTO(survey);
    }

    @Override
    public SurveyDTO.SurveyStats getSurveyStats(String startDate, String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusYears(1);
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();

        List<Survey> surveys = surveyRepository.findByResponseDateBetween(start, end);
        if (surveys.isEmpty()) {
            log.info("Aucun sondage trouvé pour la période : start={}, end={}", start, end);
            return new SurveyDTO.SurveyStats();
        }

        SurveyDTO.SurveyStats stats = new SurveyDTO.SurveyStats();

        double averageScore = surveys.stream()
                .mapToDouble(Survey::getScore)
                .average()
                .orElse(0.0);
        stats.setAverageScore(averageScore);

        Map<Long, Double> questionAverages = new HashMap<>();
        Map<Long, List<Double>> scoresByQuestion = new HashMap<>();
        for (Survey survey : surveys) {
            try {
                List<Map<String, Object>> responses = objectMapper.readValue(survey.getResponses(), List.class);
                for (Map<String, Object> response : responses) {
                    Long questionId = Long.valueOf(response.get("questionId").toString());
                    Double answer = Double.valueOf(response.get("answer").toString());
                    scoresByQuestion.computeIfAbsent(questionId, k -> new ArrayList<>()).add(answer);
                }
            } catch (Exception e) {
                log.error("Erreur lors du parsing des réponses pour surveyId={}: {}", survey.getId(), e.getMessage());
            }
        }
        for (Map.Entry<Long, List<Double>> entry : scoresByQuestion.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            questionAverages.put(entry.getKey(), avg);
        }
        stats.setQuestionAverages(questionAverages);

        Map<String, Integer> scoreDistribution = new TreeMap<>();
        for (int i = 1; i <= 5; i++) {
            scoreDistribution.put(String.valueOf(i), 0);
        }
        for (Survey survey : surveys) {
            try {
                List<Map<String, Object>> responses = objectMapper.readValue(survey.getResponses(), List.class);
                for (Map<String, Object> response : responses) {
                    String answer = response.get("answer").toString();
                    scoreDistribution.compute(answer, (k, v) -> v == null ? 1 : v + 1);
                }
            } catch (Exception e) {
                log.error("Erreur lors du parsing des réponses pour surveyId={}: {}", survey.getId(), e.getMessage());
            }
        }
        stats.setScoreDistribution(scoreDistribution);

        log.info("Statistiques calculées : averageScore={}, questionAverages={}, scoreDistribution={}",
                averageScore, questionAverages, scoreDistribution);
        return stats;
    }

    private SurveyDTO mapToDTO(Survey survey) {
        SurveyDTO dto = new SurveyDTO();
        dto.setId(survey.getId());
        dto.setTitle(survey.getTitle());
        dto.setType(survey.getType());
        dto.setQuestions(survey.getQuestions());
        dto.setResponses(survey.getResponses());
        dto.setQuestionStats(survey.getQuestionStats());
        dto.setScore(survey.getScore());
        dto.setResponseDate(survey.getResponseDate() != null ? survey.getResponseDate().toString() : null);
        dto.setStatus(survey.getStatus());
        dto.setFeedback(survey.getFeedback());
        dto.setContractClientId(survey.getContractClient() != null ? survey.getContractClient().getId() : null);
        dto.setProjectId(survey.getProject() != null ? survey.getProject().getIdProjet() : null);
        dto.setMeetingId(survey.getMeeting() != null ? survey.getMeeting().getMeetingid() : null);
        dto.setTicketId(survey.getTicket() != null ? survey.getTicket().getId() : null);
        dto.setFilledById(survey.getFilledBy().getId());
        dto.setFilledByUsername(survey.getFilledBy().getUsername());
        return dto;
    }
}