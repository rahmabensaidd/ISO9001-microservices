package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;

import java.util.List;

@Data
public class OcrData {
    private ProcessDto process;
    private List<ObjectiveDto> objectives;
    private List<OperationDto> operations;
    private List<String> majorSections;

    @Data
    public static class ProcessDto {
        private String procName;
        private String description;
        private String creationDate;
        // Ajoutez d'autres champs si nécessaire (finishDate, modifDate, etc.)
    }

    @Data
    public static class ObjectiveDto {
        private String title;
        private String axe; // À mapper vers l'enum Axe
    }

    @Data
    public static class OperationDto {
        private String operationName;
        private String operationDescription;
        private String creationDate;
    }
}
