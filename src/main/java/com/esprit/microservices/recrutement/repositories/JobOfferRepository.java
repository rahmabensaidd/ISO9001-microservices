package com.esprit.microservices.recrutement.repositories;

import com.esprit.microservices.recrutement.entities.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;


public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
}
