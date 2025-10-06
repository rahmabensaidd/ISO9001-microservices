package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Operation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface OperationRepository extends JpaRepository<Operation, Long> {
    @Query("SELECT DISTINCT u.poste FROM Operation o JOIN o.userEntities u WHERE o.id = :operationId AND u.poste IS NOT NULL")
    Set<Poste> findPostesByOperationId(@Param("operationId") Long operationId);

    @Query("SELECT o FROM Operation o WHERE LOWER(o.operationName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(o.operationDescription) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Operation> findByOperationNameContainingIgnoreCaseOrOperationDescriptionContainingIgnoreCase(@Param("query") String query);

    @Query("SELECT o FROM Operation o LEFT JOIN FETCH o.process LEFT JOIN FETCH o.tasks LEFT JOIN FETCH o.userEntities WHERE o.id = :id")
    Optional<Operation> findByIdWithProcessAndTasks(@Param("id") Long id);
    Optional<Operation> findByOperationName(String operationName);
}