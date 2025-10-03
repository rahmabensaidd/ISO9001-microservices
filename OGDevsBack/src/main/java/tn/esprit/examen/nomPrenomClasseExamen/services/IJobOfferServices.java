package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.JobOffer;

import java.util.List;
import java.util.Optional;

public interface IJobOfferServices {
    JobOffer createJobOffer(JobOffer jobOffer);
    JobOffer updateJobOffer(Long id, JobOffer jobOffer);
    Optional<JobOffer> getJobOfferById(Long id);
    List<JobOffer> getAllJobOffers();
    void deleteJobOffer(Long id);
}
