package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ProcessRepository extends JpaRepository<Process, Long> {
    @Query("SELECT p FROM Process p WHERE LOWER(p.procName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Process> findByProcNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(@Param("query") String query);
    @Query("SELECT p FROM Process p LEFT JOIN FETCH p.pilote WHERE p.id = :id")
    Process findByIdWithPilote(@Param("id") Long id);
    Optional<Process> findByProcName(String procName);

}