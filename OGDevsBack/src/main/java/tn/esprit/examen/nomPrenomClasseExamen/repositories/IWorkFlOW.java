package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.WorkFlow;
import java.util.Optional;

public interface IWorkFlOW extends JpaRepository<WorkFlow, Long> {
    Optional<WorkFlow> findByName(String name);
}