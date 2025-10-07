package com.esprit.microservices.recrutement.controllers;

import com.esprit.microservices.recrutement.entities.Candidate;
import com.esprit.microservices.recrutement.services.ICandidateServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CandidateRestController {

    private final ICandidateServices candidateService;
    private static final Logger logger = LoggerFactory.getLogger(CandidateRestController.class);

    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        logger.info("Received POST request to create candidate: {}", candidate);
        Candidate createdCandidate = candidateService.createCandidate(candidate);
        return new ResponseEntity<>(createdCandidate, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidate) {
        try {
            logger.info("Received PUT request to update candidate with id {}: {}", id, candidate);
            Candidate updatedCandidate = candidateService.updateCandidate(id, candidate);
            return new ResponseEntity<>(updatedCandidate, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.warn("Candidate with id {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Optional<Candidate> candidate = candidateService.getCandidateById(id);
        return candidate.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        logger.info("Response from getAllCandidates: {}", candidates);
        return new ResponseEntity<>(candidates, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        try {
            logger.info("Received DELETE request for candidate with id: {}", id);
            candidateService.deleteCandidate(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            logger.warn("Candidate with id {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

 /*   @PostMapping("/{candidateId}/assign-job-offer/{jobOfferId}")
    public ResponseEntity<Void> assignCandidateToJobOffer(@PathVariable Long candidateId, @PathVariable Long jobOfferId) {
        try {
            logger.info("Assigning candidate {} to job offer {}", candidateId, jobOfferId);
            candidateService.assignCandidateToJobOffer(candidateId, jobOfferId);

            Optional<Candidate> candidateOpt = candidateService.getCandidateById(candidateId);
            if (candidateOpt.isPresent()) {
                Candidate candidate = candidateOpt.get();
                String jobOfferTitle = candidate.getJobOffers().stream()
                        .filter(job -> job.getId().equals(jobOfferId))
                        .findFirst()
                        .map(JobOffer::getTitle)
                        .orElse("Unknown Job Offer");
                try {
                    emailService.sendApplicationConfirmationEmail(
                            candidate.getEmail(),
                            candidate.getFirstName() + " " + candidate.getLastName(),
                            jobOfferTitle
                    );
                    logger.info("Confirmation email sent to {}", candidate.getEmail());
                } catch (Exception e) {
                    logger.error("Failed to send confirmation email to {}: {}", candidate.getEmail(), e.getMessage());
                }
            }

            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.warn("Error assigning candidate {} to job offer {}: {}", candidateId, jobOfferId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
*/
 /*   @PostMapping("/{candidateId}/accept")
    public ResponseEntity<Candidate> acceptCandidate(@PathVariable Long candidateId, @RequestBody Map<String, String> body) {
        try {
            logger.info("Received POST request to accept candidate with id: {}", candidateId);
            Candidate candidate = candidateService.getCandidateById(candidateId)
                    .orElseThrow(() -> new IllegalArgumentException("Candidat non trouvé avec l'ID : " + candidateId));
            candidate.setStatus("Accepted");

            String acceptDateStr = body.get("acceptDate");
            try {
                if (acceptDateStr != null) {
                    String formattedDate = acceptDateStr.replace(".000Z", "");
                    candidate.setAcceptDate(LocalDateTime.parse(formattedDate));
                } else {
                    candidate.setAcceptDate(LocalDateTime.now());
                    logger.warn("acceptDate non fourni, utilisation de la date actuelle");
                }
            } catch (DateTimeParseException e) {
                logger.error("Erreur de parsing de acceptDate '{}': {}", acceptDateStr, e.getMessage());
                candidate.setAcceptDate(LocalDateTime.now());
            }

            Candidate updatedCandidate = candidateService.updateCandidate(candidateId, candidate);
            logger.info("Candidat mis à jour : {}", updatedCandidate);

            String jobOfferTitle = updatedCandidate.getJobOffers().isEmpty()
                    ? "Unknown Job Offer"
                    : updatedCandidate.getJobOffers().iterator().next().getTitle();
            try {
                emailService.sendAcceptanceEmail(
                        updatedCandidate.getEmail(),
                        updatedCandidate.getFirstName() + " " + updatedCandidate.getLastName(),
                        jobOfferTitle
                );
                logger.info("Email envoyé à {} pour l’offre {}", updatedCandidate.getEmail(), jobOfferTitle);
            } catch (Exception emailException) {
                logger.error("Échec de l’envoi de l’email à {}: {}", updatedCandidate.getEmail(), emailException.getMessage());
            }

            logger.info("Candidate {} accepted successfully and email sent", candidateId);
            return ResponseEntity.ok(updatedCandidate);
        } catch (IllegalArgumentException e) {
            logger.warn("Error accepting candidate {}: {}", candidateId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Unexpected error while accepting candidate {}: {}", candidateId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
*/
/*    @GetMapping("/sorted-by-score/{jobOfferId}")
    public ResponseEntity<List<Candidate>> getCandidatesSortedByScore(@PathVariable Long jobOfferId) {
        try {
            List<Candidate> sortedCandidates = candidateService.getAllCandidatesSortedByScore(jobOfferId);
            logger.info("Retrieved sorted candidates for job offer {}: {}", jobOfferId, sortedCandidates);
            return new ResponseEntity<>(sortedCandidates, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.warn("Job offer with id {} not found", jobOfferId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }*/
}