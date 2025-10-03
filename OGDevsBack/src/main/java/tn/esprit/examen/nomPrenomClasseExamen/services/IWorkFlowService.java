package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.WorkFlow;
import java.util.List;

public interface IWorkFlowService {
    WorkFlow saveWorkFlow(WorkFlow workFlow);
    WorkFlow getWorkflowById(Long id);
    WorkFlow getWorkflowByName(String name);
    List<WorkFlow> getAllWorkflows();
    String getWorkflowSnapshot(Long id);
}