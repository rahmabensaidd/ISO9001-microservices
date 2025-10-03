package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.ISOClause;
import java.util.List;

public interface IISOClauseService {
    ISOClause addISOClause(ISOClause isoClause);
    ISOClause updateISOClause(Long idClause, ISOClause isoClause);
    void deleteISOClause(Long idClause);
    ISOClause getISOClauseById(Long idClause);
    List<ISOClause> getAllISOClauses();
}
