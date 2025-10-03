package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Feedback;

public interface FeedbackRepository  extends JpaRepository<Feedback, Long> {
}
