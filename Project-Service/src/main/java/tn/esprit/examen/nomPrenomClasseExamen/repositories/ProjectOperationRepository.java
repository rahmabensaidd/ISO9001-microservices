package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ProjectOpp;

import java.util.List;

@Repository
public interface ProjectOperationRepository extends JpaRepository<ProjectOpp, Long> {
    @Query("SELECT p FROM ProjectOpp p WHERE p.user.email = :email")
    List<ProjectOpp> findByUserEmail(@Param("email") String email);
}
