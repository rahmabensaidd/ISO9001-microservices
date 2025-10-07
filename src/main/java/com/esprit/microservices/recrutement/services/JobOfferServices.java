package com.esprit.microservices.recrutement.services;

import com.esprit.microservices.recrutement.repositories.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.esprit.microservices.recrutement.entities.JobOffer;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class JobOfferServices implements IJobOfferServices {

    private final JobOfferRepository jobOfferRepository;

    @Override
    public JobOffer createJobOffer(JobOffer jobOffer) {
        log.info("Creating job offer: {}", jobOffer);
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public JobOffer updateJobOffer(Long id, JobOffer jobOffer) {
        if (!jobOfferRepository.existsById(id)) {
            throw new IllegalArgumentException("Job Offer with id " + id + " does not exist.");
        }
        jobOffer.setId(id);
        log.info("Updating job offer with id {}: {}", id, jobOffer);
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public Optional<JobOffer> getJobOfferById(Long id) {
        return jobOfferRepository.findById(id);
    }

    @Override
    public List<JobOffer> getAllJobOffers() {
        List<JobOffer> jobOffers = jobOfferRepository.findAll();
        log.info("Retrieved all job offers: {}", jobOffers);
        return jobOffers;
    }

    @Override
    public void deleteJobOffer(Long id) {
        if (!jobOfferRepository.existsById(id)) {
            throw new IllegalArgumentException("Job Offer with id " + id + " does not exist.");
        }
        log.info("Deleting job offer with id: {}", id);
        jobOfferRepository.deleteById(id);
    }
}