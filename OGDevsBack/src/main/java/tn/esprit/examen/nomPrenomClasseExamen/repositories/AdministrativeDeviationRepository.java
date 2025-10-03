package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.AdministrativeDeviation;

import java.time.LocalDate;
import java.util.List;

public interface AdministrativeDeviationRepository extends JpaRepository<AdministrativeDeviation, Long> {
    List<AdministrativeDeviation> findByDateBetween(LocalDate startDate, LocalDate endDate);
}