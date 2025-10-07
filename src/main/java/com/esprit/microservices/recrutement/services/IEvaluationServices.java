package com.esprit.microservices.recrutement.services;


import com.esprit.microservices.recrutement.entities.Evaluation;

import java.util.List;
import java.util.Optional;

public interface IEvaluationServices {
    Evaluation createEvaluation(Evaluation evaluation);
    Evaluation updateEvaluation(Long id, Evaluation evaluation);
    Optional<Evaluation> getEvaluationById(Long id);
    List<Evaluation> getAllEvaluations();
    void deleteEvaluation(Long id);
}