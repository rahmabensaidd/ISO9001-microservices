package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.IsoSolution;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformityType;

public interface IsoSolutionRepository extends JpaRepository<IsoSolution, Long> {
    IsoSolution findByNonConformityType(NonConformityType nonConformityType);
}
