package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ProjectTask;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    @Query("SELECT t FROM ProjectTask t WHERE t.projectOpp.user.email = :email")
    List<ProjectTask> findTasksByUserEmail(@Param("email") String email);


    @Modifying
    @Query("DELETE FROM ProjectTask pt WHERE pt.projectOpp.idProjectOperation = :projectOppId")
    void deleteByProjectOppId(@Param("projectOppId") Long projectOppId);
}
