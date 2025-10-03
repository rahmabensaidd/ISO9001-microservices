package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Feedback;

import java.util.List;
import java.util.Optional;

public interface IFeedbackServices {
    Feedback createFeedback(Feedback feedback);
    Feedback updateFeedback(Long id, Feedback feedback);
    Optional<Feedback> getFeedbackById(Long id);
    List<Feedback> getAllFeedbacks();
    void deleteFeedback(Long id);
}