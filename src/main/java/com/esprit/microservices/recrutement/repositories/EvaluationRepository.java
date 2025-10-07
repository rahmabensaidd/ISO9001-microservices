package com.esprit.microservices.recrutement.repositories;

import com.esprit.microservices.recrutement.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
}
