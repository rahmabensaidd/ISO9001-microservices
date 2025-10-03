package tn.esprit.examen.nomPrenomClasseExamen.services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ObjectiveDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ObjectiveRepo;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class ObjectiveService implements IObjectivesServices {
    private final ObjectiveRepo objectiveRepo;
    private final ProcessRepository processRepository;

    @Override
    public Objective addObjective(Objective o) {
        return objectiveRepo.save(o);
    }

    @Override
    public Objective updateObjective(Long id, Objective o) {
        Optional<Objective> exist = objectiveRepo.findById(id);
        if (exist.isPresent()) {
            Objective updatedObjective = exist.get();
            updatedObjective.setTitle(o.getTitle());
            updatedObjective.setAxe(o.getAxe());
            // Add other fields if needed
            return objectiveRepo.save(updatedObjective);
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteObjective(Long id) {
        log.info("Deleting objective with id: {}", id);
        Objective objective = objectiveRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("Objective with id {} not found", id);
                    return new RuntimeException("Objective not found");
                });

        if (objective.getProcess() != null) {
            log.info("Removing objective id: {} from process id: {}", id, objective.getProcess().getId());
            Process process = objective.getProcess();
            process.getObjectives().remove(objective);
            objective.setProcess(null);
            processRepository.save(process);
            objectiveRepo.save(objective);
        }

        // Delete the objective
        objectiveRepo.deleteById(id);
        log.info("Objective with id {} deleted successfully", id);
    }

    @Override
    public Objective getObjectiveById(Long id) {
        return objectiveRepo.findById(id).orElse(null);
    }

    @Override
    public List<Objective> getAllObjectives() {
        return objectiveRepo.findAll();
    }
    @Override
    public List<ObjectiveDTO> getAllObjectivesDTO() {
        List<Objective> objectives = objectiveRepo.findAll();
        return objectives.stream().map(objective -> {
            ObjectiveDTO dto = new ObjectiveDTO();
            dto.setIdObjective(objective.getIdObjective());
            dto.setTitle(objective.getTitle());
            dto.setAxe(objective.getAxe());

            if (objective.getProcess() != null) {
                dto.setProcessId(objective.getProcess().getId());
                dto.setProcessName(objective.getProcess().getProcName());
            }

            return dto;
        }).collect(Collectors.toList());
    }

}
