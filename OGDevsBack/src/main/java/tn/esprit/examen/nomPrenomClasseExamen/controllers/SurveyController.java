package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.SurveyDTO;
import tn.esprit.examen.nomPrenomClasseExamen.services.SurveyService;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @GetMapping("/my-surveys")
    public ResponseEntity<List<SurveyDTO>> getSurveysForCurrentUser() {
        List<SurveyDTO> surveys = surveyService.getSurveysForCurrentUser();
        return ResponseEntity.ok(surveys);
    }

    @PostMapping
    public ResponseEntity<SurveyDTO> createAndSubmitSurvey(@RequestBody SurveyDTO.CreateSurveyRequest request) {
        SurveyDTO survey = surveyService.createAndSubmitSurvey(request);
        return ResponseEntity.ok(survey);
    }

    @GetMapping("/gamification")
    public ResponseEntity<SurveyDTO.GamificationInfo> getGamificationInfo() {
        SurveyDTO.GamificationInfo info = surveyService.getGamificationInfo();
        return ResponseEntity.ok(info);
    }

    @GetMapping("/all-surveys")
    public ResponseEntity<List<SurveyDTO>> getAllSurveys() {
        List<SurveyDTO> surveys = surveyService.getAllSurveys();
        return ResponseEntity.ok(surveys);
    }
    @PutMapping("/{surveyId}/review")
    public ResponseEntity<SurveyDTO> markSurveyAsReviewed(@PathVariable Long surveyId) {
        SurveyDTO survey = surveyService.markSurveyAsReviewed(surveyId);
        return ResponseEntity.ok(survey);
    }

    @GetMapping("/stats")
    public ResponseEntity<SurveyDTO.SurveyStats> getSurveyStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        SurveyDTO.SurveyStats stats = surveyService.getSurveyStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }
}