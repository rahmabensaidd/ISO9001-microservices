package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformityDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformitySource;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Non_Conformity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IndicatorRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IIndicatorServices;
import tn.esprit.examen.nomPrenomClasseExamen.services.INonConformityService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nonconformities")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:4200",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true",
        maxAge = 3600
)
public class NonConformityRestController {

    private final INonConformityService nonConformityService;
    private final IndicatorRepository indicatorRepository;
    private final IIndicatorServices indicatorServices;

    @PostMapping("/manual")
    public NonConformityDTO addNonConformityManually(@RequestBody NonConformityDTO nonConformityDTO) {
        // Map DTO to entity
        Non_Conformity nonConformity = new Non_Conformity();
        nonConformity.setSource(nonConformityDTO.getSource());
        nonConformity.setDescription(nonConformityDTO.getDescription());
        nonConformity.setDateCreated(nonConformityDTO.getDateCreated());
        nonConformity.setType(nonConformityDTO.getType());
        nonConformity.setStatus(nonConformityDTO.getStatus());

        // Fetch the Indicator using idIndicateur from the indicator object
        if (nonConformityDTO.getIndicator() == null || nonConformityDTO.getIndicator().getIdIndicateur() == null) {
            throw new IllegalArgumentException("Valid indicator ID must be provided for the non-conformity.");
        }
        Indicator indicator = indicatorRepository.findById(nonConformityDTO.getIndicator().getIdIndicateur())
                .orElseThrow(() -> new IllegalArgumentException("Indicator not found with ID: " + nonConformityDTO.getIndicator().getIdIndicateur()));
        nonConformity.setIndicator(indicator);

        // Save the entity and map back to DTO
        Non_Conformity savedNonConformity = nonConformityService.addNonConformityManually(nonConformity);
        indicatorServices.recalculateAllIndicators(); // Recalculate currentValue and handle automatic non-conformities
        return nonConformityService.mapToDTO(savedNonConformity);
    }

    @PostMapping("/by-indicator")
    public ResponseEntity<Non_Conformity> addNonConformityByIndicator(@RequestBody Non_Conformity nonConformity) {
        Non_Conformity created = nonConformityService.addNonConformityByIndicator(nonConformity);
        indicatorServices.recalculateAllIndicators(); // Recalculate currentValue and handle automatic non-conformities
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNonConformity(@PathVariable Long id) {
        nonConformityService.deleteNonConformity(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<NonConformityDTO>> getAllNonConformities() {
        return ResponseEntity.ok(nonConformityService.getAllNonConformities());
    }

    @PutMapping("/{id}/fix")
    public ResponseEntity<NonConformityDTO> fixNonConformity(
            @PathVariable Long id,
            @RequestParam("actionTaken") String actionTaken,
            @RequestParam("fixDate") LocalDate fixDate,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {
        NonConformityDTO result = nonConformityService.fixNonConformity(id, actionTaken, fixDate, attachments);
        indicatorServices.recalculateAllIndicators(); // Recalculate currentValue after fixing
        return ResponseEntity.ok(result);
    }
}
