package com.esprit.microservices.recrutement.repositories;

import com.esprit.microservices.recrutement.entities.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import com.esprit.microservices.recrutement.entities.Candidate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByInterviewDateBetween(LocalDateTime start, LocalDateTime end);
}
