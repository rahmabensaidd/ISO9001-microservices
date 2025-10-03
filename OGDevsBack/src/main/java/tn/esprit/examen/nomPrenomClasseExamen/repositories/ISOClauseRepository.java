package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ISOClause;

public interface ISOClauseRepository extends JpaRepository<ISOClause, Long> {
}