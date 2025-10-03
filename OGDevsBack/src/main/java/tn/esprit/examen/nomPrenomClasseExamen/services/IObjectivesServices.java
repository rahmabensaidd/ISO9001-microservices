package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.ObjectiveDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;

import java.util.List;

public interface IObjectivesServices {
    Objective addObjective(Objective o);
    Objective updateObjective(Long id, Objective o); // Rename from updateProcess
    void deleteObjective(Long id); // Rename from deleteProcess
    Objective getObjectiveById(Long id);
    List<Objective> getAllObjectives();
    List<ObjectiveDTO> getAllObjectivesDTO();
}
