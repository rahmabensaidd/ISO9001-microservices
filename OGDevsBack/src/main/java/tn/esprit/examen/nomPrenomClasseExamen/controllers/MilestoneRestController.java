package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Milestone;
import tn.esprit.examen.nomPrenomClasseExamen.services.IMilestoneService;

import java.util.List;

@RestController
@RequestMapping("/api/milestone")
@RequiredArgsConstructor
public class MilestoneRestController {

    private final IMilestoneService milestoneService;

    @PostMapping("/add")
    public ResponseEntity<Milestone> addMilestone(@RequestBody Milestone milestone) {
        return ResponseEntity.ok(milestoneService.addMilestone(milestone));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable Long id, @RequestBody Milestone milestone) {
        Milestone updatedMilestone = milestoneService.updateMilestone(id, milestone);
        return updatedMilestone != null ? ResponseEntity.ok(updatedMilestone) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Milestone> getMilestoneById(@PathVariable Long id) {
        Milestone milestone = milestoneService.getMilestoneById(id);
        return milestone != null ? ResponseEntity.ok(milestone) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Milestone>> getAllMilestones() {
        return ResponseEntity.ok(milestoneService.getAllMilestones());
    }
}
