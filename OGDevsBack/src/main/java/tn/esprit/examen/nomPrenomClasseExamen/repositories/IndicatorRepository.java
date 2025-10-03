package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;

import java.util.List;

public interface IndicatorRepository extends JpaRepository<Indicator, Long> {
    Indicator findByCode(String code);
}
