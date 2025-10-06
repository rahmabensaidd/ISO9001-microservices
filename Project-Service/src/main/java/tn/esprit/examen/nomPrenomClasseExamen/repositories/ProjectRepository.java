package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Project;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClient(UserEntity client);
}
