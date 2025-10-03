package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Phase;
@Repository
public interface PhaseRepository extends JpaRepository<Phase, Long> {
    @Query("SELECT DISTINCT p FROM Phase p " +
            "JOIN FETCH p.projectOperations po " +
            "LEFT JOIN FETCH po.user " +  // Ajout de LEFT JOIN FETCH pour éviter le problème
            "WHERE p.idPhase = :idphase")
    Phase findPhaseWithOperationsAndUsers(@Param("idphase") Long idphase);
}
