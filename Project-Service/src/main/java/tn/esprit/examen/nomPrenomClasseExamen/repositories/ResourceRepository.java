package tn.esprit.examen.nomPrenomClasseExamen.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}
