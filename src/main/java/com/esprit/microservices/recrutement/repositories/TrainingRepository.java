package com.esprit.microservices.recrutement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.esprit.microservices.recrutement.entities.Training;

public interface TrainingRepository extends JpaRepository<Training,Long> {
}
