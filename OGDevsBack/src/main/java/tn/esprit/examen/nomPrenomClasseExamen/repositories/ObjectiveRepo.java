package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;

import java.util.List;

public interface ObjectiveRepo extends JpaRepository<Objective,Long> {
    @Query("SELECT o FROM Objective o JOIN FETCH o.indicators WHERE o.process.id = :processId")
    List<Objective> findByProcessIdWithIndicators(@Param("processId") Long processId);
}
