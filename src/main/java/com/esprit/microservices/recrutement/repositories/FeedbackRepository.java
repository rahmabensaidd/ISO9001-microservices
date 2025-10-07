package com.esprit.microservices.recrutement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.esprit.microservices.recrutement.entities.Feedback;

public interface FeedbackRepository  extends JpaRepository<Feedback, Long> {
}
