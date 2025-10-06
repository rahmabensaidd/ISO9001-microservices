package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class IndicatorDTO {
    private Long idIndicateur;
    private String code;
    private String libelle;
    private String frequence;
    private String unite;
    private Double cible;
    private Double currentValue;
    private String status;
    private String actif;
    private String methodeCalcul;

}
