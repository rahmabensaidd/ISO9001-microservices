package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Evaluation;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.EvaluationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IEvaluationServices;

import java.util.List;
import java.util.Optional;
@RequiredArgsConstructor
@Service
@Slf4j
public class EvaluationServices implements IEvaluationServices {

    private final EvaluationRepository evaluationRepository;



    @Override
    public Evaluation createEvaluation(Evaluation evaluation) {
        return evaluationRepository.save(evaluation);
    }

    @Override
    public Evaluation updateEvaluation(Long id, Evaluation evaluation) {
        if (!evaluationRepository.existsById(id)) {
            throw new IllegalArgumentException("Evaluation with id " + id + " does not exist.");
        }
        evaluation.setIdEvaluation(id);
        return evaluationRepository.save(evaluation);
    }

    @Override
    public Optional<Evaluation> getEvaluationById(Long id) {
        return evaluationRepository.findById(id);
    }

    @Override
    public List<Evaluation> getAllEvaluations() {
        List<Evaluation> evaluations = evaluationRepository.findAll();
        log.info("Évaluations récupérées : {}", evaluations); // Ajoutez ce log pour déboguer
        return evaluations;
    }
    @Override
    public void deleteEvaluation(Long id) {
        if (!evaluationRepository.existsById(id)) {
            throw new IllegalArgumentException("Evaluation with id " + id + " does not exist.");
        }
        evaluationRepository.deleteById(id);
    }
}