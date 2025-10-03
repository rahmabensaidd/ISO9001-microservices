package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Interview;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByInterviewDateBetween(LocalDateTime start, LocalDateTime end);
}
