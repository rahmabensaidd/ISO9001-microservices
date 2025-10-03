package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Axe;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ObjectiveRepo;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.OperationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.dto.OcrData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class OcrService {

    private static final Logger logger = LoggerFactory.getLogger(OcrService.class);

    @Autowired
    private ProcessRepository processRepository;

    @Autowired
    private ObjectiveRepo objectiveRepository;

    @Autowired
    private OperationRepository operationRepository;

    @Transactional
    public void saveOcrData(OcrData ocrData) {
        if (ocrData == null || ocrData.getProcess() == null) {
            logger.error("OcrData or Process data is null");
            throw new IllegalArgumentException("Invalid OCR data provided");
        }

        try {
            // Vérifier si un processus avec le même procName existe
            Optional<Process> existingProcessOptional = processRepository.findByProcName(ocrData.getProcess().getProcName());
            Process process;

            if (existingProcessOptional.isPresent()) {
                logger.info("Updating existing process: {}", ocrData.getProcess().getProcName());
                process = existingProcessOptional.get();
                updateProcessFields(process, ocrData.getProcess());
            } else {
                logger.info("Creating new process: {}", ocrData.getProcess().getProcName());
                process = createNewProcess(ocrData.getProcess());
            }

            // Sauvegarder le processus (cela initialise l'ID si nouveau)
            process = processRepository.save(process);

            // Gérer les objectifs
            Set<Objective> objectives = processObjectives(ocrData.getObjectives(), process);
            objectiveRepository.saveAll(objectives);

            // Gérer les opérations
            Set<Operation> operations = processOperations(ocrData.getOperations(), process);
            operationRepository.saveAll(operations);

            // Mettre à jour les relations dans le processus
            process.setObjectives(objectives);
            process.setOperations(operations);
            processRepository.save(process);

            logger.info("Successfully saved process: {}", process.getProcName());

        } catch (Exception e) {
            logger.error("Error during data recording: {}", e.getMessage(), e);
            throw new RuntimeException("Error lors de l'enregistrement: " + e.getMessage(), e);
        }
    }

    private void updateProcessFields(Process process, OcrData.ProcessDto processDto) {
        process.setDescription(processDto.getDescription());
        try {
            process.setCreationDate(LocalDate.parse(processDto.getCreationDate()));
        } catch (DateTimeParseException e) {
            logger.warn("Invalid creation date format: {}, using current date", processDto.getCreationDate());
            process.setCreationDate(LocalDate.now()); // Valeur par défaut
        }
        // Ajoutez ici la mise à jour d'autres champs comme modifDate, finishDate, etc., si nécessaire
    }

    private Process createNewProcess(OcrData.ProcessDto processDto) {
        Process process = new Process();
        process.setProcName(processDto.getProcName());
        process.setDescription(processDto.getDescription());
        try {
            process.setCreationDate(LocalDate.parse(processDto.getCreationDate()));
        } catch (DateTimeParseException e) {
            logger.warn("Invalid creation date format: {}, using current date", processDto.getCreationDate());
            process.setCreationDate(LocalDate.now()); // Valeur par défaut
        }
        // Initialiser d'autres champs par défaut si nécessaire (pilote, workflow, x, y)
        process.setX(0); // Exemple de valeur par défaut
        process.setY(0); // Exemple de valeur par défaut
        return process;
    }

    private Set<Objective> processObjectives(List<OcrData.ObjectiveDto> objectiveDtos, Process process) {
        Set<Objective> objectives = new HashSet<>();
        if (objectiveDtos != null) {
            for (OcrData.ObjectiveDto objectiveDto : objectiveDtos) {
                Objective objective = new Objective();
                objective.setTitle(objectiveDto.getTitle());
                objective.setAxe(Axe.valueOf(objectiveDto.getAxe())); // Assurez-vous que l'enum Axe est mappé correctement
                objective.setProcess(process);
                objectives.add(objective);
            }
        }
        return objectives;
    }

    private Set<Operation> processOperations(List<OcrData.OperationDto> operationDtos, Process process) {
        Set<Operation> operations = new HashSet<>();
        if (operationDtos != null) {
            for (OcrData.OperationDto operationDto : operationDtos) {
                Operation operation = new Operation();
                operation.setOperationName(operationDto.getOperationName());
                operation.setOperationDescription(operationDto.getOperationDescription());
                try {
                    operation.setCreationDate(LocalDate.parse(operationDto.getCreationDate()));
                } catch (DateTimeParseException e) {
                    logger.warn("Invalid creation date format: {}, using current date", operationDto.getCreationDate());
                    operation.setCreationDate(LocalDate.now()); // Valeur par défaut
                }
                operation.setProcess(process);
                operations.add(operation);
            }
        }
        return operations;
    }
}
