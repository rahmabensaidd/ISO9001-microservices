package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.KpiData;

import java.util.List;

public interface KpiDataRepository extends JpaRepository<KpiData, Long> {
    List<KpiData> findByIndicatorIdIndicateur(Long indicatorId);
}
