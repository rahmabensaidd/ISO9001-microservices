package com.esprit.microservices.recrutement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.esprit.microservices.recrutement.entities.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
}
