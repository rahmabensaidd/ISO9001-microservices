package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.SurveyDTO;
import java.util.List;

public interface SurveyService {
    List<SurveyDTO> getSurveysForCurrentUser();

    List<SurveyDTO> getAllSurveys();

    SurveyDTO createAndSubmitSurvey(SurveyDTO.CreateSurveyRequest request);
    SurveyDTO.SurveyStats getSurveyStats(String startDate, String endDate);
    SurveyDTO markSurveyAsReviewed(Long surveyId);
    SurveyDTO.GamificationInfo getGamificationInfo(); // Nouvelle méthode
}