// src/main/java/tn/esprit/examen/nomPrenomClasseExamen/controllers/AuditFileController.java
package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformityDTO;
import tn.esprit.examen.nomPrenomClasseExamen.services.AiSuggestionService;
import tn.esprit.examen.nomPrenomClasseExamen.services.NonConformityService;
import tn.esprit.examen.nomPrenomClasseExamen.services.TextExtractionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit")
public class AuditFileController {

    private static final Logger logger = LoggerFactory.getLogger(AuditFileController.class);

    private final TextExtractionService textExtractionService;
    private final AiSuggestionService aiSuggestionService;
    private final NonConformityService nonConformityService;

    public AuditFileController(
            TextExtractionService textExtractionService,
            AiSuggestionService aiSuggestionService,
            NonConformityService nonConformityService) {
        this.textExtractionService = textExtractionService;
        this.aiSuggestionService = aiSuggestionService;
        this.nonConformityService = nonConformityService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Uploading file: {}", file.getOriginalFilename());
            String text = textExtractionService.extractText(file);
            List<String> solutions = aiSuggestionService.suggest(text);

            return ResponseEntity.ok(Map.of(
                    "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown",
                    "fileSize", file.getSize(),
                    "textPreview", text.substring(0, Math.min(text.length(), 500)),
                    "suggestions", solutions
            ));
        } catch (Exception e) {
            logger.error("Failed to process file upload: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Erreur lors du traitement du fichier",
                    "details", e.getMessage()
            ));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveNonConformity(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Received save request: {}", request);
            String nonConformity = (String) request.get("nonConformity");
            @SuppressWarnings("unchecked")
            List<String> aiSuggestions = (List<String>) request.get("aiSuggestions");
            @SuppressWarnings("unchecked")
            List<String> selectedProposals = (List<String>) request.get("correctionProposals");

            if (nonConformity == null || nonConformity.isBlank() || aiSuggestions == null || selectedProposals == null || selectedProposals.isEmpty()) {
                logger.warn("Invalid request data: nonConformity={}, aiSuggestions={}, selectedProposals={}",
                        nonConformity, aiSuggestions, selectedProposals);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Non-conformité, suggestions AI ou propositions sélectionnées manquantes"
                ));
            }

            NonConformityDTO saved = nonConformityService.mapToDTO(
                    nonConformityService.addNonConformityFromFile(nonConformity, aiSuggestions, selectedProposals)
            );

            logger.info("Non-conformity saved successfully: {}", saved.getIdNonConformity());
            return ResponseEntity.ok(Map.of(
                    "message", "Non-conformité sauvegardée avec succès",
                    "nonConformity", saved
            ));
        } catch (Exception e) {
            logger.error("Failed to save non-conformity: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Erreur lors de la sauvegarde",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/non-conformities")
    public ResponseEntity<List<NonConformityDTO>> getSavedNonConformities() {
        logger.info("Fetching all non-conformities");
        return ResponseEntity.ok(nonConformityService.getAllNonConformities());
    }
}