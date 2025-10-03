package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.JobOffer;
import tn.esprit.examen.nomPrenomClasseExamen.services.IJobOfferServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/job-offers")
public class JobOfferRestController {

    private final IJobOfferServices jobOfferServices;
    private static final Logger logger = LoggerFactory.getLogger(JobOfferRestController.class);

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Réservé aux admins
    public ResponseEntity<JobOffer> createJobOffer(@RequestBody JobOffer jobOffer) {
        logger.info("Received POST request to create job offer: {}", jobOffer);
        JobOffer createdJobOffer = jobOfferServices.createJobOffer(jobOffer);
        return new ResponseEntity<>(createdJobOffer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Réservé aux admins
    public ResponseEntity<JobOffer> updateJobOffer(@PathVariable Long id, @RequestBody JobOffer jobOffer) {
        try {
            logger.info("Received PUT request to update job offer with id {}: {}", id, jobOffer);
            JobOffer updatedJobOffer = jobOfferServices.updateJobOffer(id, jobOffer);
            return new ResponseEntity<>(updatedJobOffer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.warn("Job offer with id {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Nécessite une authentification
    public ResponseEntity<JobOffer> getJobOfferById(@PathVariable Long id) {
        Optional<JobOffer> jobOffer = jobOfferServices.getJobOfferById(id);
        return jobOffer.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<JobOffer>> getAllJobOffers() {
        List<JobOffer> jobOffers = jobOfferServices.getAllJobOffers();
        logger.info("Response from getAllJobOffers: {}", jobOffers);
        return new ResponseEntity<>(jobOffers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Réservé aux admins
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        try {
            logger.info("Received DELETE request for job offer with id: {}", id);
            jobOfferServices.deleteJobOffer(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            logger.warn("Job offer with id {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}