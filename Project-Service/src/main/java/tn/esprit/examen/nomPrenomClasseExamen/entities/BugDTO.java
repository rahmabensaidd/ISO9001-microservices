package tn.esprit.examen.nomPrenomClasseExamen.entities;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BugDTO {

    private Long idBug;
    private String priority;
    private String description;
    private String source_issue;  // Nom de l'attribut conservé tel quel
    private String Status;        // Nom de l'attribut conservé tel quel
    private LocalDate repportDate; // Nom de l'attribut conservé tel quel
    private UserDTO developer;    // Associer le developer à un UserDTO


    // Constructeur avec tous les champs
    public BugDTO(Long idBug, String priority, String description, String source_issue,
                  String Status, LocalDate repportDate, UserDTO developer) {
        this.idBug = idBug;
        this.priority = priority;
        this.description = description;
        this.source_issue = source_issue;  // Nom de l'attribut conservé tel quel
        this.Status = Status;              // Nom de l'attribut conservé tel quel
        this.repportDate = repportDate;    // Nom de l'attribut conservé tel quel
        this.developer = developer;
    }

    // Constructeur qui prend une entité Bug et la transforme en BugDTO
    public BugDTO(Bug bug) {
        this.idBug = bug.getIdBug();
        this.priority = bug.getPriority();
        this.description = bug.getDescription();
        this.source_issue = bug.getSource_issue();
        this.Status = bug.getStatus();
        this.repportDate = bug.getRepportDate();
        this.developer = (bug.getDeveloper() != null) ? new UserDTO(bug.getDeveloper()) : null; // Conversion de l'utilisateur
    }
}
