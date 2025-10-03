package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Milestone;
import java.util.List;

public interface IMilestoneService {
    Milestone addMilestone(Milestone milestone);
    Milestone updateMilestone(Long milestoneId, Milestone milestone);
    void deleteMilestone(Long milestoneId);
    Milestone getMilestoneById(Long milestoneId);
    List<Milestone> getAllMilestones();
}
