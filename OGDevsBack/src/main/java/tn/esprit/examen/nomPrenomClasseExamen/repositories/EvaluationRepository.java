package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Evaluation;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
}
