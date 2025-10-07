package com.esprit.microservices.recrutement.controllers;

import com.esprit.microservices.recrutement.entities.JobOffer;
import com.esprit.microservices.recrutement.services.IJobOfferServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<JobOffer> createJobOffer(@RequestBody JobOffer jobOffer) {
        logger.info("Received POST request to create job offer: {}", jobOffer);
        JobOffer createdJobOffer = jobOfferServices.createJobOffer(jobOffer);
        return new ResponseEntity<>(createdJobOffer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
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