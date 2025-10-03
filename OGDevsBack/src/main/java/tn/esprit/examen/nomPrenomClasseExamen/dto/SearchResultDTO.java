package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchResultDTO {
    private String entityType;
    private Long id;
    private String displayName;
    private String description;
    private String processName;
    private String piloteName;
    private List<String> taskNames;
    private List<String> assignedUsers; // Add this field
}