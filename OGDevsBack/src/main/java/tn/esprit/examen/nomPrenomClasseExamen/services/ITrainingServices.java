package tn.esprit.examen.nomPrenomClasseExamen.services;


import tn.esprit.examen.nomPrenomClasseExamen.entities.Training;

import java.util.List;
import java.util.Optional;

public interface ITrainingServices {
    Training createTraining(Training training);
    Training updateTraining(Long id, Training training);
    Optional<Training> getTrainingById(Long id);
    List<Training> getAllTrainings();
    void deleteTraining(Long id);
}