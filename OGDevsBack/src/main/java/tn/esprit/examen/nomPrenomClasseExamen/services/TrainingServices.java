package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Training;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.TrainingRepository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class TrainingServices implements ITrainingServices {

    private final TrainingRepository trainingRepository;

    @Override
    public Training createTraining(Training training) {
        return trainingRepository.save(training);
    }

    @Override
    public Training updateTraining(Long id, Training training) {
        if (!trainingRepository.existsById(id)) {
            throw new IllegalArgumentException("Training with id " + id + " does not exist.");
        }
        training.setTrainingId(id);
        return trainingRepository.save(training);
    }

    @Override
    public Optional<Training> getTrainingById(Long id) {
        return trainingRepository.findById(id);
    }

    @Override
    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    @Override
    public void deleteTraining(Long id) {
        if (!trainingRepository.existsById(id)) {
            throw new IllegalArgumentException("Training with id " + id + " does not exist.");
        }
        trainingRepository.deleteById(id);
    }
}