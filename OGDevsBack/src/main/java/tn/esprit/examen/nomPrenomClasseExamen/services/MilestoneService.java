package tn.esprit.examen.nomPrenomClasseExamen.services;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Milestone;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.MilestoneRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MilestoneService implements IMilestoneService {

    private final MilestoneRepository milestoneRepository;

    @Override
    public Milestone addMilestone(Milestone milestone) {
        return milestoneRepository.save(milestone);
    }

    @Override
    public Milestone updateMilestone(Long milestoneId, Milestone updatedMilestone) {
        Optional<Milestone> existingMilestone = milestoneRepository.findById(milestoneId);
        if (existingMilestone.isPresent()) {
            Milestone milestone = existingMilestone.get();
            milestone.setMilestone_name(updatedMilestone.getMilestone_name());
            milestone.setDuration_hours(updatedMilestone.getDuration_hours());
            return milestoneRepository.save(milestone);
        }
        return null; // ou lever une exception
    }

    @Override
    public void deleteMilestone(Long milestoneId) {
        milestoneRepository.deleteById(milestoneId);
    }

    @Override
    public Milestone getMilestoneById(Long milestoneId) {
        return milestoneRepository.findById(milestoneId).orElse(null);
    }

    @Override
    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }
}