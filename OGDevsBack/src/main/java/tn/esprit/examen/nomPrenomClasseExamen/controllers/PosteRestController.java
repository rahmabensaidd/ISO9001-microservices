package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;
import tn.esprit.examen.nomPrenomClasseExamen.services.IPosteService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/postes")
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class PosteRestController {

    private final IPosteService posteService;

    @PostMapping
    public ResponseEntity<?> createPoste(@RequestBody Poste poste) {
        try {
            log.info("Received request to create Poste: {}", poste);
            Poste createdPoste = posteService.createPoste(poste);
            log.info("Poste created successfully with ID: {}", createdPoste.getId());
            return new ResponseEntity<>(createdPoste, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating Poste: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create poste: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPosteById(@PathVariable Long id) {
        try {
            log.info("Fetching Poste with ID: {}", id);
            Poste poste = posteService.getPosteById(id);
            log.info("Poste fetched successfully with ID: {}", id);
            return ResponseEntity.ok(poste);
        } catch (RuntimeException e) {
            log.error("Error fetching Poste with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error fetching Poste with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch poste: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPostes() {
        try {
            log.info("Fetching all Postes");
            List<Poste> postes = posteService.getAllPostes();
            log.info("Fetched {} Postes", postes.size());
            return ResponseEntity.ok(postes);
        } catch (Exception e) {
            log.error("Error fetching all Postes: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch postes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePoste(@PathVariable Long id, @RequestBody Poste poste) {
        try {
            log.info("Received request to update Poste with ID: {}", id);
            Poste updatedPoste = posteService.updatePoste(id, poste);
            log.info("Poste updated successfully with ID: {}", updatedPoste.getId());
            return ResponseEntity.ok(updatedPoste);
        } catch (RuntimeException e) {
            log.error("Error updating Poste with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error updating Poste with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update poste: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePoste(@PathVariable Long id) {
        try {
            log.info("Received request to delete Poste with ID: {}", id);
            posteService.deletePoste(id);
            log.info("Poste deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Poste not found or deletion failed for ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error deleting Poste with ID: {}", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete poste: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{posteId}/assign-user/{userId}")
    public ResponseEntity<?> assignUserToPoste(@PathVariable Long posteId, @PathVariable String userId) {
        try {
            log.info("Received request to assign User {} to Poste {}", userId, posteId);
            Poste updatedPoste = posteService.assignUserToPoste(posteId, userId);
            log.info("User {} assigned to Poste {} successfully", userId, posteId);
            return ResponseEntity.ok(updatedPoste);
        } catch (RuntimeException e) {
            log.error("Error assigning User {} to Poste {}: {}", userId, posteId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error assigning User {} to Poste {}: {}", userId, posteId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign user to poste: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}