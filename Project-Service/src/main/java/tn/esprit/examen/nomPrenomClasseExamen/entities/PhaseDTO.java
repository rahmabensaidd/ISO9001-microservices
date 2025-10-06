package tn.esprit.examen.nomPrenomClasseExamen.entities;

import java.util.Set;
import java.util.stream.Collectors;

public class PhaseDTO {
    private Long idPhase;
    private String phase_name;
    private String description;
    private Set<ProjectOppDTO> projectOperations;  // Liste de ProjectOppDTO

    // Constructeur qui prend une Phase pour initialiser les champs
    public PhaseDTO(Phase phase) {
        this.idPhase = phase.getIdPhase();
        this.phase_name = phase.getPhase_name();
        this.description = phase.getDescription();
        // Transformer chaque ProjectOpp en ProjectOppDTO
        this.projectOperations = phase.getProjectOperations().stream()
                .map(ProjectOppDTO::new)  // Utilisation du constructeur de ProjectOppDTO
                .collect(Collectors.toSet());
    }


    // Getters et Setters

    public Long getIdPhase() {
        return idPhase;
    }

    public void setIdPhase(Long idPhase) {
        this.idPhase = idPhase;
    }

    public String getPhase_name() {
        return phase_name;
    }

    public void setPhase_name(String phase_name) {
        this.phase_name = phase_name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<ProjectOppDTO> getProjectOperations() {
        return projectOperations;
    }

    public void setProjectOperations(Set<ProjectOppDTO> projectOperations) {
        this.projectOperations = projectOperations;
    }
}
