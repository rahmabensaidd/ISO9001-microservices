package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ProjetRequest;
import tn.esprit.examen.nomPrenomClasseExamen.services.ProjetRequestService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projet-requests")
public class ProjetRequestController {

    @Autowired
    private ProjetRequestService projetRequestService;

    @PostMapping
    public ResponseEntity<String> createProjetRequest(@RequestBody Map<String, Object> projetRequestData) {
        try {
            String message = projetRequestService.createProjetRequest(projetRequestData);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création de la demande: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetRequest> getProjetRequestById(@PathVariable Long id) {
        try {
            return projetRequestService.getProjetRequestById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération de la demande: " + e.getMessage());
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<ProjetRequest>> getAllProjetRequestsForAdmin(Authentication authentication) {
        try {
            List<ProjetRequest> projetRequests = projetRequestService.getAllProjetRequestsForAdmin();
            return ResponseEntity.ok(projetRequests);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des demandes: " + e.getMessage());
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<ProjetRequest>> getProjetRequestsByCurrentUser() {
        try {
            List<ProjetRequest> projetRequests = projetRequestService.getProjetRequestsByCurrentUser();
            return ResponseEntity.ok(projetRequests);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des demandes: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProjetRequest(@PathVariable Long id, @RequestBody Map<String, Object> projetRequestData) {
        try {
            String message = projetRequestService.updateProjetRequest(id, projetRequestData);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour de la demande: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateProjetRequestForAdmin(@PathVariable Long id, @RequestBody Map<String, Object> projetRequestData) {
        try {
            String message = projetRequestService.updateProjetRequestForAdmin(id, projetRequestData);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour de la demande: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProjetRequest(@PathVariable Long id) {
        try {
            String message = projetRequestService.deleteProjetRequest(id);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression de la demande: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteProjetRequestForAdmin(@PathVariable Long id) {
        try {
            String message = projetRequestService.deleteProjetRequestForAdmin(id);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression de la demande: " + e.getMessage());
        }
    }

    @PostMapping("/accept/{email}/{id}")
    public ResponseEntity<String> acceptProjetRequest(@PathVariable Long id,@PathVariable String email) {
        try {
            String message = projetRequestService.acceptProjetRequest(id,email);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'acceptation de la demande: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<List<ProjetRequestService.ProjectStatsDTO>> getProjectStats() {
        try {
            List<ProjetRequestService.ProjectStatsDTO> stats = projetRequestService.getProjectStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des statistiques: " + e.getMessage());
        }
    }
}