package tn.esprit.examen.nomPrenomClasseExamen.services;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ISOClause;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ISOClauseRepository;

import java.util.List;
import java.util.Optional;
@Slf4j
@Service
@RequiredArgsConstructor
public class ISOClauseService implements IISOClauseService {

    private final ISOClauseRepository isoClauseRepository;

    @Override
    public ISOClause addISOClause(ISOClause isoClause) {
        return isoClauseRepository.save(isoClause);
    }

    @Override
    public ISOClause updateISOClause(Long idClause, ISOClause updatedISOClause) {
        Optional<ISOClause> existingClause = isoClauseRepository.findById(idClause);
        if (existingClause.isPresent()) {
            ISOClause clause = existingClause.get();
            clause.setName(updatedISOClause.getName());
            clause.setDescription(updatedISOClause.getDescription());
            clause.setComplianceRecord(updatedISOClause.getComplianceRecord());
            clause.setQmsElements(updatedISOClause.getQmsElements());
            return isoClauseRepository.save(clause);
        }
        return null; // ou lever une exception
    }

    @Override
    public void deleteISOClause(Long idClause) {
        isoClauseRepository.deleteById(idClause);
    }

    @Override
    public ISOClause getISOClauseById(Long idClause) {
        return isoClauseRepository.findById(idClause).orElse(null);
    }

    @Override
    public List<ISOClause> getAllISOClauses() {
        return isoClauseRepository.findAll();
    }
}
