package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.ProcessDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;

import java.util.List;
import java.util.Map;

public interface IProcessServices {
    Process addProcess(Process p);
    Process updateProcess(Long id, Process process);
    void deleteProcess(Long id);
    Process getProcessById(Long id);
    List<ProcessDTO> getAllProcesses();
    void assignOperationToProcess(Long processId, Long operationId);
    void assignObjectiveToProcess(Long processId, Long objectiveId);
    long getTotalProcesses();
    double getAverageOperationsPerProcess();
    double getAverageProcessDuration();
    double getCompletionRate();
    Map<String, Long> getProcessesByPilote();
    double getOperationsDurationCorrelation();
}