package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t WHERE LOWER(t.taskDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.taskStatus) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> findByTaskDescriptionContainingIgnoreCaseOrTaskStatusContainingIgnoreCase(@Param("query") String query);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.operation WHERE t.id = :id")
    Optional<Task> findByIdWithOperation(@Param("id") Long id);
    Optional<Task> findByTaskDescription(String taskDescription);
}