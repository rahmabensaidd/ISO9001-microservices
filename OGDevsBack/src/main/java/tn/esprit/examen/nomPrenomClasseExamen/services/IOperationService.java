package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.OperationDTO; // Add this import
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface IOperationService {
    Operation addOperation(Operation operation);
    Operation updateOperation(Long operationId, Operation updatedOperation);
    void deleteOperation(Long operationId);
    Operation getOperationById(Long operationId);
    List<OperationDTO> getAllOperations();
    void assignTaskToOperation(Long operationId, Long taskId);
    Set<Poste> getPostesForOperation(Long operationId);
    void assignPostesToOperation(Long operationId, Set<Long> posteIds);
    long getTotalOperations();
    double getAverageTasksPerOperation();
    double getAverageOperationDuration();
    double getCompletionRate();
    Map<String, Long> getOperationsByUser();
    double getTasksDurationCorrelation();
}