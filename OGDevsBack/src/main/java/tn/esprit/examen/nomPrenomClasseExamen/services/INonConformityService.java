// src/main/java/tn/esprit/examen/nomPrenomClasseExamen/services/INonConformityService.java
package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformityDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Non_Conformity;

import java.time.LocalDate;
import java.util.List;

public interface INonConformityService {
    Non_Conformity addNonConformityManually(Non_Conformity nonConformity);
    Non_Conformity addNonConformityByIndicator(Non_Conformity nonConformity);
    Non_Conformity addNonConformityFromFile(String description, List<String> aiSuggestions, List<String> selectedProposals);
    void deleteNonConformity(Long idNonConformity);
    List<NonConformityDTO> getAllNonConformities();
    NonConformityDTO fixNonConformity(Long id, String actionTaken, LocalDate fixDate, List<MultipartFile> attachments);
    NonConformityDTO mapToDTO(Non_Conformity nc);
}