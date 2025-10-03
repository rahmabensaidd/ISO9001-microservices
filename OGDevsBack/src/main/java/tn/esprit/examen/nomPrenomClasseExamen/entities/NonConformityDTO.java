package tn.esprit.examen.nomPrenomClasseExamen.entities;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class NonConformityDTO {
    private Long idNonConformity;
    private NonConformitySource source;
    private String description;
    private LocalDate dateCreated;
    private NonConformityType type;
    private String status;
    private String actionTaken;
    private LocalDate fixDate;
    private String detectedBy;
    private LocalDate dateDetected;
    private String fixedBy;
    private Boolean isEffective;
    private List<String> attachments = new ArrayList<>();
    private List<String> aiSuggestions = new ArrayList<>();
    private List<String> selectedProposals = new ArrayList<>();
    private Long indicatorId;
    private IndicatorDTO indicator;

    public Long getIndicatorId() {
        return indicatorId;
    }

    public void setIndicatorId(Long indicatorId) {
        this.indicatorId = indicatorId;
    }

    public IndicatorDTO getIndicator() {
        return indicator;
    }

    public void setIndicator(IndicatorDTO indicator) {
        this.indicator = indicator;
    }
}